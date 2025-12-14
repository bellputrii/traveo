'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { removeNotification } from '../../store/categories/categoriesSlice';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const iconColorMap = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
};

const borderColorMap = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
  warning: 'border-l-amber-500',
};

export default function Notification({ 
  id, 
  type, 
  title, 
  message 
}: NotificationProps) {
  const dispatch = useAppDispatch();
  const Icon = iconMap[type];

  // Auto-dismiss setelah 4 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeNotification(id));
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, dispatch]);

  const handleClose = () => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="animate-slide-in">
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-md ${borderColorMap[type]} border-l-4`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`${iconColorMap[type]} flex-shrink-0 mt-0.5`}>
              <Icon className="w-5 h-5" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {message}
                  </p>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2 p-0.5 rounded hover:bg-gray-100"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}