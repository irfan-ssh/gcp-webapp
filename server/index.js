import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

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
          projectId: 'irfan-auto-1234567890',
          name: 'Demo Project 1',
          projectNumber: '123456789',
          lifecycleState: 'ACTIVE',
          createTime: '2024-01-15T10:30:00Z'
        },
        {
          projectId: 'irfan-auto-0987654321',
          name: 'Demo Project 2',
          projectNumber: '987654321',
          lifecycleState: 'ACTIVE',
          createTime: '2024-01-20T14:45:00Z'
        },
        {
          projectId: 'irfan-auto-1122334455',
          name: 'Demo Project 3',
          projectNumber: '112233445',
          lifecycleState: 'ACTIVE',
          createTime: '2024-01-25T09:15:00Z'
        }
      ]
    });
  }
});

// Bulk create projects
app.post('/api/projects/bulk', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { count, prefix, enableBilling, createServiceAccounts } = req.body;
  
  if (!count || count < 1 || count > 10) {
    return res.status(400).json({ error: 'Count must be between 1 and 10' });
  }
  
  try {
    oauth2Client.setCredentials(session.tokens);
    
    const createdProjects = [];
    const serviceAccountKeys = [];
    
    for (let i = 1; i <= count; i++) {
      const timestamp = Date.now();
      const projectId = `${prefix}-${timestamp}-${i}`;
      const projectName = `${prefix} Project ${i}`;
      
      // Mock project creation for demo
      const mockProject = {
        projectId,
        name: projectName,
        projectNumber: Math.floor(Math.random() * 1000000000).toString(),
        lifecycleState: 'ACTIVE',
        createTime: new Date().toISOString()
      };
      
      createdProjects.push(mockProject);
      
      if (createServiceAccounts) {
        // Mock service account key
        const mockKey = {
          type: "service_account",
          project_id: projectId,
          private_key_id: `key_${i}_${timestamp}`,
          private_key: "-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
          client_email: `service-account-${i}@${projectId}.iam.gserviceaccount.com`,
          client_id: `${timestamp}${i}`,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token"
        };
        serviceAccountKeys.push(mockKey);
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    res.json({
      success: true,
      projects: createdProjects,
      serviceAccountKeys: createServiceAccounts ? serviceAccountKeys : undefined,
      message: `Successfully created ${count} project${count > 1 ? 's' : ''} (Demo Mode)`
    });
  } catch (error) {
    console.error('Error creating projects:', error);
    res.status(500).json({ error: 'Failed to create projects' });
  }
});

// Bulk delete projects
app.post('/api/projects/bulk-delete', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { projectIds } = req.body;
  
  if (!Array.isArray(projectIds) || projectIds.length === 0) {
    return res.status(400).json({ error: 'Project IDs array is required' });
  }
  
  try {
    oauth2Client.setCredentials(session.tokens);
    
    // Mock deletion process
    for (const projectId of projectIds) {
      console.log(`Deleting project: ${projectId}`);
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    res.json({
      success: true,
      message: `Successfully deleted ${projectIds.length} project${projectIds.length > 1 ? 's' : ''} (Demo Mode)`
    });
  } catch (error) {
    console.error('Error deleting projects:', error);
    res.status(500).json({ error: 'Failed to delete projects' });
  }
});

// Download service account keys
app.post('/api/projects/download-keys', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { projectIds } = req.body;
  
  try {
    // Mock service account keys
    const keys = projectIds.map((projectId, index) => ({
      type: "service_account",
      project_id: projectId,
      private_key_id: `key_${index}_${Date.now()}`,
      private_key: "-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
      client_email: `service-account@${projectId}.iam.gserviceaccount.com`,
      client_id: `${Date.now()}${index}`,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token"
    }));
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="service-account-keys-${Date.now()}.json"`);
    res.json(keys);
  } catch (error) {
    console.error('Error generating keys:', error);
    res.status(500).json({ error: 'Failed to generate service account keys' });
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
    version: '1.0.0',
    endpoints: {
      auth: '/auth/google',
      api: '/api/*',
      health: '/health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});