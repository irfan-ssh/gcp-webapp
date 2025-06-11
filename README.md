# GCP Project Manager

A beautiful, production-ready web application for managing Google Cloud Platform projects with OAuth authentication and full CRUD operations.

## Features

- **Google OAuth Authentication** - Secure browser-based authentication with GCP
- **Project Management** - Create, list, and delete GCP projects
- **Modern UI** - Beautiful, responsive design with smooth animations
- **Real-time Notifications** - Success/error notifications for all operations
- **Production Ready** - Built with TypeScript, Express.js, and React

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Cloud Resource Manager API
   - Identity and Access Management (IAM) API
   - Google+ API (for user info)

### 2. OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3001/auth/callback` (for development)
5. Save the Client ID and Client Secret

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GCP_PROJECT_ID=your_gcp_project_id_here
   ```

### 4. Installation & Running

```bash
# Install dependencies
npm install

# Start the development server (both frontend and backend)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `GET /api/user` - Get authenticated user info
- `GET /api/projects` - List user's GCP projects
- `POST /api/projects` - Create a new GCP project
- `DELETE /api/projects/:projectId` - Delete a GCP project
- `POST /api/logout` - Logout and clear session

## Architecture

### Frontend (React + TypeScript)
- Modern React with hooks and TypeScript
- Tailwind CSS for styling
- Axios for API communication
- Lucide React for icons

### Backend (Express.js + Node.js)
- Express.js REST API
- Google APIs integration
- OAuth 2.0 authentication flow
- Session management

## Production Deployment

For production deployment:

1. Set up HTTPS for OAuth callbacks
2. Use a proper session store (Redis, database)
3. Configure CORS properly
4. Set up proper error handling and logging
5. Use environment-specific configurations

## Security Features

- Secure OAuth 2.0 flow
- CORS protection
- Session-based authentication
- Input validation
- Proper error handling

## Demo Mode

The application includes demo/mock responses for development and testing when GCP APIs are not available or configured.