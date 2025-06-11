import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`flex items-start gap-3 px-6 py-4 rounded-xl shadow-lg border ${getStyles()} transition-all duration-300 transform max-w-md`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{notification.title}</p>
        <p className="text-sm opacity-90 mt-1">{notification.message}</p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};