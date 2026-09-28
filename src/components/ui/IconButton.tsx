import React from 'react';

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'ghost' | 'tonal' | 'solid';

export interface IconButtonProps {
  icon: string;
  /** Required: becomes both the accessible name and the tooltip. */
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  /** Active controls (shuffle on, repeat on, liked) tint with the accent. */
  active?: boolean;
  /** Renders the filled variant of the Material symbol. */
  filled?: boolean;
  disabled?: boolean;
  className?: string;
  /** Overrides the colour applied when `active` is true. */
  activeClassName?: string;
}

const SIZES: Record<IconButtonSize, { box: string; glyph: string }> = {
  xs: { box: 'w-7 h-7', glyph: 'text-base' },
  sm: { box: 'w-9 h-9', glyph: 'text-lg' },
  md: { box: 'w-10 h-10', glyph: 'text-2xl' },
  lg: { box: 'w-12 h-12', glyph: 'text-3xl' },
};

const VARIANTS: Record<IconButtonVariant, string> = {
  ghost: 'hover:bg-surface-container-highest',
  tonal: 'bg-surface-container-high hover:bg-surface-bright',
  solid: 'bg-primary-container text-on-primary-container hover:opacity-90 shadow-lg shadow-primary-container/20',
};

/**
 * The single icon-button primitive. Every interactive glyph in the app goes
 * through it so focus rings, hit areas and accessible names stay consistent.
 */
export const IconButton: React.FC<Readonly<IconButtonProps>> = ({
  icon,
  label,
  onClick,
  size = 'sm',
  variant = 'ghost',
  active = false,
  filled = false,
  disabled = false,
  className = '',
  activeClassName = 'text-primary',
}) => {
  const { box, glyph } = SIZES[size];
  const tone = variant === 'solid' ? '' : active ? activeClassName : 'text-on-surface-variant hover:text-on-surface';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      className={`${box} ${VARIANTS[variant]} ${tone} rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      <span
        className={`material-symbols-outlined ${glyph}`}
        style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
    </button>
  );
};

export default IconButton;
