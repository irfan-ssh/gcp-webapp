import React, { useState } from 'react';
import { Plus, Settings, Loader, Download, AlertCircle } from 'lucide-react';
import { CreateProjectRequest } from '../../types';
import { ProgressBar } from '../Common/ProgressBar';

interface CreateProjectsSectionProps {
  onCreateProjects: (request: CreateProjectRequest) => Promise<any>;
  loading: boolean;
  progress: any;
  isAuthenticated: boolean;
}

export const CreateProjectsSection: React.FC<CreateProjectsSectionProps> = ({
  onCreateProjects,
  loading,
  progress,
  isAuthenticated
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateProjectRequest>({
    count: 1,
    prefix: 'irfan-auto',
    enableBilling: true,
    createServiceAccounts: true
  });
  const [lastCreatedKeys, setLastCreatedKeys] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      const response = await onCreateProjects(formData);
      if (response.serviceAccountKeys) {
        setLastCreatedKeys(response.serviceAccountKeys);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error creating projects:', error);
    }
  };

  const downloadKeys = () => {
    const dataStr = JSON.stringify(lastCreatedKeys, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `service-account-keys-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 rounded-xl p-3">
            <Plus className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Projects</h2>
            <p className="text-gray-600">Bulk create GCP projects with service accounts</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={!isAuthenticated || loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Projects
        </button>
      </div>

      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800">Please authenticate with Google Cloud to create projects</p>
          </div>
        </div>
      )}

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

      {lastCreatedKeys.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Service Account Keys Ready</p>
                <p className="text-sm text-blue-700">{lastCreatedKeys.length} keys available for download</p>
              </div>
            </div>
            <button
              onClick={downloadKeys}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Download Keys
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="border-t border-gray-100 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Projects
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.count}
                  onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 10 projects at once</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Prefix
                </label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="irfan-auto"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Projects will be named: {formData.prefix}-timestamp</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableBilling"
                  checked={formData.enableBilling}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableBilling: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="enableBilling" className="text-sm font-medium text-gray-700">
                  Enable Billing (Auto-detect billing account)
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="createServiceAccounts"
                  checked={formData.createServiceAccounts}
                  onChange={(e) => setFormData(prev => ({ ...prev, createServiceAccounts: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="createServiceAccounts" className="text-sm font-medium text-gray-700">
                  Create Service Accounts with Owner permissions
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Create {formData.count} Project{formData.count > 1 ? 's' : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    count: 1,
                    prefix: 'irfan-auto',
                    enableBilling: true,
                    createServiceAccounts: true
                  });
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};