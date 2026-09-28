import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContext, type Toast, type ToastApi, type ToastOptions } from './toastStore';

export interface ToastProviderProps {
  children: React.ReactNode;
}

const DEFAULT_DURATION = 3200;

/**
 * Owns the toast queue and renders the viewport.
 *
 * `children` is a stable element, so state changes here re-render only the
 * toast stack — not the app below it.
 */
export const ToastProvider: React.FC<Readonly<ToastProviderProps>> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((current) => [
        ...current.slice(-2), // never stack more than three at once
        { id, message, icon: options.icon, actionLabel: options.actionLabel, onAction: options.onAction },
      ]);
      const timer = window.setTimeout(() => dismiss(id), options.duration ?? DEFAULT_DURATION);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-3 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-rise flex items-center gap-3 glass-player rounded-full pl-5 pr-2 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          >
            {toast.icon && (
              <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {toast.icon}
              </span>
            )}
            <span className="text-sm font-semibold text-on-surface">{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  dismiss(toast.id);
                }}
                className="text-xs font-bold uppercase tracking-widest text-primary px-3 py-1 rounded-full hover:bg-surface-container-highest transition-colors"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
