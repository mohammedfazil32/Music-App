import React from 'react';
import { Link } from 'react-router-dom';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional "View all" style link. */
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  className?: string;
  size?: 'md' | 'lg';
}

/** Consistent section heading with an optional trailing action. */
export const SectionHeader: React.FC<Readonly<SectionHeaderProps>> = ({
  title,
  subtitle,
  actionLabel,
  actionTo,
  onAction,
  className = '',
  size = 'lg',
}) => (
  <div className={`flex justify-between items-end gap-6 mb-8 ${className}`}>
    <div>
      <h2 className={`${size === 'lg' ? 'text-3xl' : 'text-2xl'} font-extrabold tracking-tight text-on-surface`}>
        {title}
      </h2>
      {subtitle && <p className="text-on-surface-variant font-medium mt-1">{subtitle}</p>}
    </div>
    {actionLabel && actionTo && (
      <Link to={actionTo} className="text-primary font-bold text-sm hover:underline shrink-0">
        {actionLabel}
      </Link>
    )}
    {actionLabel && !actionTo && (
      <button type="button" onClick={onAction} className="text-primary font-bold text-sm hover:underline shrink-0">
        {actionLabel}
      </button>
    )}
  </div>
);

export default SectionHeader;
