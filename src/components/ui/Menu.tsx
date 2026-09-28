import React, { useCallback, useEffect, useRef, useState } from 'react';
import IconButton, { type IconButtonSize } from './IconButton';

export interface MenuItem {
  icon: string;
  label: string;
  onSelect: () => void;
  /** Renders in the error colour, for destructive actions. */
  danger?: boolean;
  disabled?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  /** Accessible name for the trigger. */
  label: string;
  icon?: string;
  size?: IconButtonSize;
  className?: string;
}

const MENU_WIDTH = 232;

/**
 * Overflow menu for track and collection actions.
 *
 * The panel is positioned `fixed` from the trigger's bounding box rather than
 * absolutely inside it, so it can never be clipped by the rounded, scrolling
 * containers it opens from. It closes on outside click, Escape, scroll and
 * resize (since a fixed panel would otherwise drift away from its trigger).
 */
export const Menu: React.FC<Readonly<MenuProps>> = ({
  items,
  label,
  icon = 'more_horiz',
  size = 'sm',
  className = '',
}) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setPosition(null), []);

  const open = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(12, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 12));
    // Flip above the trigger when there is not enough room below.
    const estimatedHeight = items.length * 44 + 16;
    const openUpwards = rect.bottom + estimatedHeight > window.innerHeight - 12;
    setPosition({ top: openUpwards ? rect.top - estimatedHeight - 8 : rect.bottom + 8, left });
  }, [items.length]);

  useEffect(() => {
    if (!position) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [position, close]);

  return (
    <div ref={triggerRef} className={className}>
      <IconButton
        icon={icon}
        label={label}
        size={size}
        active={position !== null}
        onClick={(event) => {
          event.stopPropagation();
          if (position) close();
          else open();
        }}
      />
      {position && (
        <div
          ref={panelRef}
          role="menu"
          aria-label={label}
          onClick={(event) => event.stopPropagation()}
          style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          className="fixed z-[90] py-2 rounded-2xl bg-surface-container-highest shadow-[0_24px_60px_rgba(0,0,0,0.6)] animate-rise"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(event) => {
                event.stopPropagation();
                close();
                item.onSelect();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                item.danger
                  ? 'text-error hover:bg-error-container/30'
                  : 'text-on-surface hover:bg-surface-bright'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
