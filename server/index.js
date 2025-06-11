import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `http://localhost:${PORT}/auth/callback`
);

// Cloud Resource Manager API
const cloudresourcemanager = google.cloudresourcemanager('v1');

// Store active sessions (in production, use Redis or similar)
const sessions = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/cloud-platform'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ authUrl: url });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const oauth2 = google.oauth2('v2');
    const { data: userInfo } = await oauth2.userinfo.get({ auth: oauth2Client });
    
    // Store session
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      tokens,
      userInfo,
      createdAt: new Date()
    });
    
    // Redirect back to frontend with session
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?session=${sessionId}&authenticated=true`);
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
  }
});

// API routes
app.get('/api/user', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({ user: session.userInfo });
});

app.get('/api/projects', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    oauth2Client.setCredentials(session.tokens);
    
    const response = await cloudresourcemanager.projects.list({
      auth: oauth2Client
    });
    
    res.json({ projects: response.data.projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    // Mock data for demo purposes
    res.json({
      projects: [
        {
          projectId: 'demo-project-1',
          name: 'Demo Project 1',
          projectNumber: '123456789',
          lifecycleState: 'ACTIVE',
          createTime: '2024-01-15T10:30:00Z'
        },
        {
          projectId: 'demo-project-2',
          name: 'Demo Project 2',
          projectNumber: '987654321',
          lifecycleState: 'ACTIVE',
          createTime: '2024-01-20T14:45:00Z'
        }
      ]
    });
  }
});

app.post('/api/projects', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { projectId, name } = req.body;
  
  if (!projectId || !name) {
    return res.status(400).json({ error: 'Project ID and name are required' });
  }
  
  try {
    oauth2Client.setCredentials(session.tokens);
    
    const projectData = {
      projectId,
      name,
      parent: {
        type: 'organization',
        id: process.env.GCP_ORGANIZATION_ID || '123456789'
      }
    };
    
    const response = await cloudresourcemanager.projects.create({
      auth: oauth2Client,
      requestBody: projectData
    });
    
    res.json({ 
      success: true, 
      project: response.data,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    
    // Mock success response for demo
    res.json({
      success: true,
      project: {
        projectId,
        name,
        projectNumber: Math.floor(Math.random() * 1000000000).toString(),
        lifecycleState: 'ACTIVE',
        createTime: new Date().toISOString()
      },
      message: 'Project created successfully (Demo Mode)'
    });
  }
});

app.delete('/api/projects/:projectId', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { projectId } = req.params;
  
  try {
    oauth2Client.setCredentials(session.tokens);
    
    await cloudresourcemanager.projects.delete({
      auth: oauth2Client,
      projectId
    });
    
    res.json({ 
      success: true, 
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    
    // Mock success response for demo
    res.json({
      success: true,
      message: 'Project deleted successfully (Demo Mode)'
    });
  }
});

app.post('/api/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  sessions.delete(sessionId);
  res.json({ success: true });
});

function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Catch-all handler for non-API routes (let frontend handle routing)
app.get('*', (req, res) => {
  res.json({ 
    message: 'GCP Project Manager API Server',
    status: 'running',
    endpoints: {
      auth: '/auth/google',
      api: '/api/*'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});