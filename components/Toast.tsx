import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className="pointer-events-auto flex items-center p-4 rounded-lg shadow-lg border bg-white animate-slide-up min-w-[300px] max-w-md">
      <div className={`flex-shrink-0 mr-3 ${toast.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-800">{toast.message}</div>
      <button onClick={onRemove} className="ml-3 text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};