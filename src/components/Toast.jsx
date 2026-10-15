import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-200',
      bg: 'bg-emerald-50 text-emerald-900',
      iconColor: 'text-emerald-600',
    },
    error: {
      icon: AlertCircle,
      border: 'border-rose-200',
      bg: 'bg-rose-50 text-rose-900',
      iconColor: 'text-rose-600',
    },
    info: {
      icon: Info,
      border: 'border-indigo-200',
      bg: 'bg-indigo-50 text-indigo-900',
      iconColor: 'text-indigo-600',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.success;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border shadow-xl animate-in slide-in-from-bottom-5 duration-200 max-w-sm">
      <div className={`p-1.5 rounded-xl ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>
      <div className="text-xs font-semibold text-slate-800 flex-1">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
