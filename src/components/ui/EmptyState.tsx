import React from 'react';

export interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Shown wherever a collection can legitimately be empty. */
export const EmptyState: React.FC<Readonly<EmptyStateProps>> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center bg-surface-container-low rounded-3xl px-8 py-16 ${className}`}
  >
    <span className="material-symbols-outlined text-5xl text-on-surface-variant/50 mb-4">{icon}</span>
    <h3 className="text-xl font-bold text-on-surface">{title}</h3>
    {description && <p className="text-on-surface-variant text-sm mt-2 max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-6 bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
