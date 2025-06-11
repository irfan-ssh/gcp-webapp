import React, { useState, useEffect } from 'react';
import { Cloud, Plus, Trash2, LogOut, User, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface Project {
  projectId: string;
  name: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ projectId: '', name: '' });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session');
    const authenticated = urlParams.get('authenticated');
    
    if (session && authenticated) {
      setSessionId(session);
      localStorage.setItem('sessionId', session);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedSession = localStorage.getItem('sessionId');
      if (savedSession) {
        setSessionId(savedSession);
      }
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchUser();
      fetchProjects();
    }
  }, [sessionId]);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      handleAuthError();
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      addNotification('error', 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = () => {
    setUser(null);
    setSessionId(null);
    localStorage.removeItem('sessionId');
  };

  const initiateGoogleAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/google`);
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Error initiating auth:', error);
      addNotification('error', 'Authentication failed');
    }
  };

  const createProject = async () => {
    if (!newProject.projectId || !newProject.name) {
      addNotification('error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/projects`, newProject, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      
      if (response.data.success) {
        addNotification('success', response.data.message);
        setNewProject({ projectId: '', name: '' });
        setShowCreateForm(false);
        fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      addNotification('error', 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm(`Are you sure you want to delete project "${projectId}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      
      if (response.data.success) {
        addNotification('success', response.data.message);
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      addNotification('error', 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/logout`, {}, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      handleAuthError();
    }
  };

  const generateProjectId = () => {
    const randomString = Math.random().toString(36).substring(2, 8);
    setNewProject(prev => ({ 
      ...prev, 
      projectId: `project-${randomString}` 
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Cloud className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">GCP Project Manager</h1>
            <p className="text-gray-600 mb-8">Manage your Google Cloud Platform projects with ease</p>
            
            <button
              onClick={initiateGoogleAuth}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Authenticate with Google Cloud
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            } transition-all duration-300 transform`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-xl p-3">
              <Cloud className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GCP Project Manager</h1>
              <p className="text-gray-600">Manage your cloud projects</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Project Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              <p className="text-gray-600">Set up a new Google Cloud Platform project</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          {showCreateForm && (
            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProject.projectId}
                      onChange={(e) => setNewProject(prev => ({ ...prev, projectId: e.target.value }))}
                      placeholder="Enter project ID"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      onClick={generateProjectId}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200"
                      title="Generate random ID"
                    >
                      🎲
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createProject}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Create Project
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProject({ projectId: '', name: '' });
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
              <p className="text-gray-600">Manage your existing GCP projects</p>
            </div>
            <button
              onClick={fetchProjects}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : '🔄'}
              Refresh
            </button>
          </div>

          {loading && projects.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-600">Create your first project to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.projectId}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-100 rounded-lg p-2 group-hover:bg-blue-200 transition-colors duration-200">
                      <Cloud className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.lifecycleState === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.lifecycleState}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">ID: {project.projectId}</p>
                  <p className="text-sm text-gray-600 mb-4">Number: {project.projectNumber}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(project.createTime).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteProject(project.projectId)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;