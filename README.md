# GCP Project Manager - Professional Edition

A comprehensive, production-ready web application for managing Google Cloud Platform projects with advanced features including bulk operations, real-time progress tracking, and professional UI/UX.

## 🚀 Features

### Core Functionality
- **Google OAuth Authentication** - Secure browser-based authentication with GCP
- **Bulk Project Creation** - Create up to 10 projects simultaneously with progress tracking
- **Project Management** - List, select, and manage existing GCP projects
- **Bulk Deletion** - Delete multiple projects with safety confirmations
- **Service Account Management** - Auto-create service accounts with Owner permissions
- **Key Generation & Download** - Generate and download service account keys as JSON

### Advanced Features
- **Real-time Progress Tracking** - Live progress bars for all operations
- **Dark/Light Mode** - Toggle between themes with system preference detection
- **Toast Notifications** - Success/error notifications with auto-dismiss
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Professional UI** - Modern design with smooth animations and micro-interactions
- **Safety Features** - Multiple confirmation dialogs for destructive operations
- **Rate Limiting** - API protection against abuse
- **Error Handling** - Comprehensive error handling with user-friendly messages

### Technical Features
- **TypeScript** - Full type safety throughout the application
- **Modern React** - Hooks, context, and modern patterns
- **Express.js Backend** - RESTful API with security middleware
- **Google Cloud APIs** - Direct integration with GCP services
- **Session Management** - Secure session handling
- **CORS Protection** - Proper cross-origin resource sharing setup

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for HTTP requests
- **Custom Hooks** for state management

### Backend
- **Node.js** with Express.js
- **Google APIs** for GCP integration
- **Helmet** for security headers
- **Rate Limiting** for API protection
- **CORS** middleware

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Google Cloud Platform account
- GCP project with billing enabled

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Cloud Resource Manager API
   - Identity and Access Management (IAM) API
   - Google+ API (for user info)

### 2. OAuth Credentials Setup

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3001/auth/callback` (development)
   - Your production callback URL
5. Save the Client ID and Client Secret

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GCP_PROJECT_ID=your_gcp_project_id_here
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

### 4. Installation & Running

```bash
# Install dependencies
npm install

# Start development server (both frontend and backend)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `POST /api/logout` - Logout and clear session

### User Management
- `GET /api/user` - Get authenticated user info

### Project Management
- `GET /api/projects` - List user's GCP projects
- `POST /api/projects/bulk` - Create multiple projects
- `POST /api/projects/bulk-delete` - Delete multiple projects
- `POST /api/projects/download-keys` - Download service account keys

### System
- `GET /health` - Health check endpoint

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Auth/
│   │   └── AuthSection.tsx
│   ├── Projects/
│   │   ├── CreateProjectsSection.tsx
│   │   └── ProjectManagementSection.tsx
│   └── Common/
│       ├── ProgressBar.tsx
│       ├── ConfirmDialog.tsx
│       └── NotificationToast.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useNotifications.ts
│   └── useProjects.ts
├── services/
│   ├── authService.ts
│   └── projectService.ts
├── types/
│   └── index.ts
└── App.tsx
```

### State Management
- **Custom Hooks** for business logic
- **React Context** for global state
- **Local Storage** for persistence
- **Session Management** for authentication

## 🔒 Security Features

- **OAuth 2.0 Flow** - Secure authentication with proper scopes
- **HTTPS Enforcement** - Secure communication
- **Rate Limiting** - Protection against API abuse
- **CORS Configuration** - Proper cross-origin setup
- **Input Validation** - Sanitized user inputs
- **Session Security** - Secure session management
- **Helmet.js** - Security headers

## 🎨 UI/UX Features

### Design System
- **Consistent Color Palette** - Professional color scheme
- **Typography Scale** - Readable font hierarchy
- **Spacing System** - 8px grid system
- **Component Library** - Reusable UI components

### Interactions
- **Hover States** - Interactive feedback
- **Loading States** - Progress indicators
- **Animations** - Smooth transitions
- **Responsive Design** - Mobile-first approach

### Accessibility
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - ARIA labels and descriptions
- **High Contrast** - Accessible color combinations
- **Focus Management** - Clear focus indicators

## 📊 Performance Optimizations

- **Code Splitting** - Lazy loading of components
- **Memoization** - React.memo and useMemo
- **Efficient Re-renders** - Optimized state updates
- **Bundle Optimization** - Tree shaking and minification

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Backend Deployment (Railway/Render)
```bash
# Set environment variables
# Deploy server/ folder
```

### Environment Variables for Production
```env
NODE_ENV=production
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Authentication flow works
- [ ] Project creation (single and bulk)
- [ ] Project listing and refresh
- [ ] Project selection and bulk operations
- [ ] Project deletion with confirmations
- [ ] Service account key download
- [ ] Dark/light mode toggle
- [ ] Responsive design on mobile
- [ ] Error handling scenarios
- [ ] Rate limiting behavior

## 🐛 Troubleshooting

### Common Issues

**Authentication Failed**
- Check OAuth credentials in Google Console
- Verify redirect URIs match exactly
- Ensure APIs are enabled

**Projects Not Loading**
- Check API permissions
- Verify billing is enabled
- Check browser console for errors

**Rate Limiting**
- Wait for rate limit window to reset
- Implement exponential backoff

## 📈 Future Enhancements

- [ ] Project templates and presets
- [ ] Scheduled operations
- [ ] Team collaboration features
- [ ] Audit logging
- [ ] Advanced filtering and search
- [ ] Export/import configurations
- [ ] Webhook integrations
- [ ] Multi-organization support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Cloud Platform for APIs
- React team for the framework
- Tailwind CSS for styling
- Lucide for icons

---

**Built with ❤️ for the GCP community**