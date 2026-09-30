import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts(prev => [...prev.slice(-4), { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, dur?: number) => showToast(msg, 'success', dur), [showToast]);
  const error = useCallback((msg: string, dur?: number) => showToast(msg, 'error', dur), [showToast]);
  const warning = useCallback((msg: string, dur?: number) => showToast(msg, 'warning', dur), [showToast]);
  const info = useCallback((msg: string, dur?: number) => showToast(msg, 'info', dur), [showToast]);

  const value = useMemo(
    () => ({ showToast, success, error, warning, info }),
    [showToast, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Non-blocking Toast Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-3 select-none"
      >
        {toasts.map(toast => {
          const typeConfig = {
            success: {
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
              border: 'border-emerald-200 dark:border-emerald-900/60',
              bg: 'bg-white dark:bg-[#161619]',
            },
            error: {
              icon: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
              border: 'border-rose-200 dark:border-rose-900/60',
              bg: 'bg-white dark:bg-[#161619]',
            },
            warning: {
              icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
              border: 'border-amber-200 dark:border-amber-900/60',
              bg: 'bg-white dark:bg-[#161619]',
            },
            info: {
              icon: <Info className="w-4 h-4 text-neutral-500 shrink-0" />,
              border: 'border-neutral-200 dark:border-neutral-800',
              bg: 'bg-white dark:bg-[#161619]',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border shadow-lg transition-all transform duration-200 ${typeConfig.bg} ${typeConfig.border} text-neutral-900 dark:text-neutral-100 font-sans text-xs`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {typeConfig.icon}
                <span className="font-medium truncate">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return safe fallback if used outside provider
    return {
      showToast: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };
  }
  return ctx;
};
