import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMarket();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-2.5 rounded-2xl p-3.5 shadow-lg border text-xs font-bold transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
                : isError
                ? 'bg-red-900 text-white border-red-700 shadow-red-950/20'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />}
              {isError && <AlertCircle className="h-4 w-4 text-red-300 shrink-0" />}
              {!isSuccess && !isError && <Info className="h-4 w-4 text-blue-300 shrink-0" />}
              <span className="leading-snug">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-white/70 hover:text-white shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
