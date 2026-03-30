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
    error: <AlertCircle size={18} className="text-red-400" />,
    success: <CheckCircle2 size={18} className="text-green-400" />,
    info: <Info size={18} className="text-blue-400" />,
    chef: <Flame size={18} className="text-yellow-500" />
  };

  const colors = {
    error: 'border-red-500/20 bg-red-500/5',
    success: 'border-green-500/20 bg-green-500/5',
    info: 'border-blue-500/20 bg-blue-500/5',
    chef: 'border-yellow-500/20 bg-yellow-500/5'
  };

  return (
    <div className={`glass flex items-center gap-3 p-4 rounded-2xl border ${colors[type]} shadow-2xl animate-slide-in pointer-events-auto min-w-[300px] max-w-md group`}>
      <div className="shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium text-white/90 flex-1 leading-tight">
        {message}
      </p>
      <button 
        onClick={() => onRemove(id)}
        className="text-white/20 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
      >
        <X size={14} />
      </button>
      <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full rounded-full overflow-hidden">
        <div className="h-full bg-current opacity-20 animate-toast-progress" style={{ color: type === 'chef' ? '#EAB308' : '' }} />
      </div>
    </div>
  );
}
