import React, { useState } from 'react';
import { Trash2, RefreshCw, CheckSquare, Square, AlertTriangle, Download, ExternalLink } from 'lucide-react';
import { Project } from '../../types';
import { ProgressBar } from '../Common/ProgressBar';
import { ConfirmDialog } from '../Common/ConfirmDialog';

interface ProjectManagementSectionProps {
  projects: Project[];
  loading: boolean;
  progress: any;
  isAuthenticated: boolean;
  onRefresh: () => void;
  onToggleSelection: (projectId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onDeleteProjects: (projectIds: string[]) => Promise<void>;
  getSelectedProjects: () => Project[];
}

export const ProjectManagementSection: React.FC<ProjectManagementSectionProps> = ({
  projects,
  loading,
  progress,
  isAuthenticated,
  onRefresh,
  onToggleSelection,
  onSelectAll,
  onDeleteProjects,
  getSelectedProjects
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'selected' | 'all'>('selected');

  const selectedProjects = getSelectedProjects();
  const allSelected = projects.length > 0 && projects.every(p => p.selected);
  const someSelected = projects.some(p => p.selected);

  const handleDeleteClick = (type: 'selected' | 'all') => {
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    const projectsToDelete = deleteType === 'all' 
      ? projects.map(p => p.projectId)
      : selectedProjects.map(p => p.projectId);
    
    await onDeleteProjects(projectsToDelete);
    setShowDeleteDialog(false);
  };

  const getGCPConsoleUrl = (projectId: string) => {
    return `https://console.cloud.google.com/home/dashboard?project=${projectId}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 rounded-xl p-3">
            <Trash2 className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Projects</h2>
            <p className="text-gray-600">
              {projects.length} project{projects.length !== 1 ? 's' : ''} found
              {selectedProjects.length > 0 && ` • ${selectedProjects.length} selected`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading || !isAuthenticated}
            className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {progress && (
        <div className="mb-6">
          <ProgressBar
            current={progress.current}
            total={progress.total}
            status={progress.status}
            projectId={progress.projectId}
          />
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectAll(!allSelected)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
            {someSelected && (
              <span className="text-sm text-gray-600">
                {selectedProjects.length} of {projects.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedProjects.length > 0 && (
              <button
                onClick={() => handleDeleteClick('selected')}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedProjects.length})
              </button>
            )}
            {projects.length > 0 && (
              <button
                onClick={() => handleDeleteClick('all')}
                disabled={loading}
                className="bg-red-800 hover:bg-red-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Delete All ({projects.length})
              </button>
            )}
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-600">Create some projects to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.projectId}
              className={`border rounded-xl p-4 transition-all duration-200 ${
                project.selected 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onToggleSelection(project.projectId)}
                    className="flex-shrink-0"
                  >
                    {project.selected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.lifecycleState === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.lifecycleState}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>ID: {project.projectId}</span>
                      <span>Number: {project.projectNumber}</span>
                      <span>Created: {new Date(project.createTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={getGCPConsoleUrl(project.projectId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Open in GCP Console"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteType === 'all' ? 'All' : 'Selected'} Projects`}
        message={
          deleteType === 'all'
            ? `Are you sure you want to delete all ${projects.length} projects? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedProjects.length} selected project${selectedProjects.length > 1 ? 's' : ''}? This action cannot be undone.`
        }
        confirmText="Delete Projects"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};