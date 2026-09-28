import { createContext, useContext } from 'react';

/** Transient confirmation messages ("Added to Liked Songs"). */
export interface Toast {
  id: number;
  message: string;
  /** Material Symbols glyph name. */
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastOptions {
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Milliseconds before auto-dismiss. */
  duration?: number;
}

export interface ToastApi {
  notify: (message: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside <ToastProvider>');
  return value;
}
