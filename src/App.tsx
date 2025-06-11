import React, { useEffect } from 'react';
import { Cloud, Moon, Sun } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import { useProjects } from './hooks/useProjects';
import { AuthSection } from './components/Auth/AuthSection';
import { CreateProjectsSection } from './components/Projects/CreateProjectsSection';
import { ProjectManagementSection } from './components/Projects/ProjectManagementSection';
import { NotificationToast } from './components/Common/NotificationToast';

function App() {
  const { isAuthenticated, sessionId } = useAuth();
  const { notifications, addNotification, removeNotification } = useNotifications();
  const {
    projects,
    loading,
    progress,
    fetchProjects,
    createProjects,
    deleteProjects,
    toggleProjectSelection,
    selectAllProjects,
    getSelectedProjects
  } = useProjects(sessionId);

  const [darkMode, setDarkMode] = React.useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects().catch((error) => {
        addNotification('error', 'Failed to fetch projects', error.message);
      });
    }
  }, [isAuthenticated, fetchProjects, addNotification]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCreateProjects = async (request: any) => {
    try {
      const response = await createProjects(request);
      addNotification('success', 'Projects Created', `Successfully created ${request.count} project${request.count > 1 ? 's' : ''}`);
      return response;
    } catch (error: any) {
      addNotification('error', 'Creation Failed', error.message || 'Failed to create projects');
      throw error;
    }
  };

  const handleDeleteProjects = async (projectIds: string[]) => {
    try {
      await deleteProjects(projectIds);
      addNotification('success', 'Projects Deleted', `Successfully deleted ${projectIds.length} project${projectIds.length > 1 ? 's' : ''}`);
    } catch (error: any) {
      addNotification('error', 'Deletion Failed', error.message || 'Failed to delete projects');
      throw error;
    }
  };

  const handleRefreshProjects = async () => {
    try {
      await fetchProjects();
      addNotification('info', 'Projects Refreshed', 'Project list has been updated');
    } catch (error: any) {
      addNotification('error', 'Refresh Failed', error.message || 'Failed to refresh projects');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>

      {/* Header */}
      <header className={`border-b shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-xl p-3">
              <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                GCP Project Manager
              </h1>
              <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Professional cloud project management
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                darkMode 
                  ? 'text-yellow-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Authentication Section */}
        <AuthSection />

        {/* Create Projects Section */}
        <CreateProjectsSection
          onCreateProjects={handleCreateProjects}
          loading={loading}
          progress={progress}
          isAuthenticated={isAuthenticated}
        />

        {/* Project Management Section */}
        <ProjectManagementSection
          projects={projects}
          loading={loading}
          progress={progress}
          isAuthenticated={isAuthenticated}
          onRefresh={handleRefreshProjects}
          onToggleSelection={toggleProjectSelection}
          onSelectAll={selectAllProjects}
          onDeleteProjects={handleDeleteProjects}
          getSelectedProjects={getSelectedProjects}
        />
      </main>

      {/* Footer */}
      <footer className={`border-t mt-16 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              GCP Project Manager - Built with React, TypeScript & Tailwind CSS
            </p>
            <p className={`text-sm mt-2 transition-colors duration-300 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Secure • Fast • Professional
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;