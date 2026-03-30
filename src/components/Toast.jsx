import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Flame } from 'lucide-react';

export default function Toast({ id, message, type = 'error', onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const icons = {
    error: <AlertCircle size={18} className="text-white" />,
    success: <CheckCircle2 size={18} className="text-white" />,
    info: <Info size={18} className="text-white" />,
    chef: <Flame size={18} className="text-white" />
  };

  const colors = {
    error: 'border-red-500 bg-red-500',
    success: 'border-green-500 bg-green-500',
    info: 'border-blue-500 bg-blue-500',
    chef: 'border-yellow-500 bg-yellow-500'
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${colors[type]} shadow-2xl animate-slide-in pointer-events-auto min-w-[300px] max-w-md group`}>
      <div className="shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium text-white flex-1 leading-tight">
        {message}
      </p>
      <button 
        onClick={() => onRemove(id)}
        className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-black/10"
      >
        <X size={14} />
      </button>
      <div className="absolute bottom-0 left-0 h-[2px] bg-black w-full rounded-full overflow-hidden">
        <div className="h-full bg-white animate-toast-progress" />
      </div>
    </div>
  );
}
