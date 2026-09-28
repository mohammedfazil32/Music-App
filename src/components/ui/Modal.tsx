import React, { useEffect, useRef } from 'react';
import IconButton from './IconButton';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Centred dialog on a blurred scrim.
 *
 * Handles its own Escape key and backdrop dismissal, locks background scroll,
 * and moves focus into the panel on open so keyboard users are not stranded
 * behind the scrim.
 */
export const Modal: React.FC<Readonly<ModalProps>> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className = 'max-w-md',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Prefer the first field; fall back to the panel itself.
    const focusTarget =
      panelRef.current?.querySelector<HTMLElement>('input, textarea, button:not([data-modal-close])') ?? panelRef.current;
    focusTarget?.focus();

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-surface-dim/80 backdrop-blur-md animate-fade"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`w-full ${className} bg-surface-container-high rounded-3xl p-8 shadow-[0_40px_80px_rgba(0,0,0,0.6)] animate-rise outline-none`}
      >
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">{title}</h2>
            {description && <p className="text-on-surface-variant text-sm mt-2">{description}</p>}
          </div>
          <IconButton icon="close" label="Close dialog" onClick={onClose} className="-mt-1 -mr-1" />
        </div>
        {children}
        {footer && <div className="flex items-center justify-end gap-3 mt-8">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
