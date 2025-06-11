import React from 'react';
import { Loader } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  status: string;
  projectId?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  status,
  projectId
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Loader className="w-5 h-5 animate-spin text-blue-600" />
        <div>
          <p className="font-semibold text-blue-900">Operation in Progress</p>
          <p className="text-sm text-blue-700">{status}</p>
          {projectId && (
            <p className="text-xs text-blue-600 mt-1">Current: {projectId}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">Progress</span>
          <span className="text-blue-700 font-medium">{current} of {total} ({percentage}%)</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};