import React, { useCallback, useRef, useState } from 'react';
import { clamp } from '../../lib/format';

export interface SliderProps {
  value: number;
  max: number;
  /** Fires continuously while dragging when `live` is set. */
  onChange?: (value: number) => void;
  /** Fires on release, on click, and on every keyboard adjustment. */
  onCommit?: (value: number) => void;
  ariaLabel: string;
  /** Keyboard increment. Defaults to 1/20th of the range. */
  step?: number;
  className?: string;
  /** Track thickness, e.g. `h-1` or `h-1.5`. */
  trackClassName?: string;
  fillClassName?: string;
  /** Live sliders (volume) update as you drag; seekbars commit on release. */
  live?: boolean;
  disabled?: boolean;
  showThumb?: boolean;
}

/**
 * Pointer- and keyboard-accessible slider used for seeking and volume.
 *
 * A native `<input type="range">` cannot be styled into the Sonic Curator
 * gradient track without vendor pseudo-elements, so this implements the
 * `slider` ARIA role directly: pointer capture for dragging, arrow keys for
 * fine control, Home/End for the extremes.
 *
 * While dragging, the thumb follows a local draft value so the incoming
 * playback clock cannot fight the user's hand.
 */
export const Slider: React.FC<Readonly<SliderProps>> = ({
  value,
  max,
  onChange,
  onCommit,
  ariaLabel,
  step,
  className = '',
  trackClassName = 'h-1.5',
  fillClassName = 'bg-gradient-to-r from-primary to-tertiary',
  live = false,
  disabled = false,
  showThumb = true,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [draft, setDraft] = useState(0);

  const displayed = dragging ? draft : value;
  const ratio = max > 0 ? clamp(displayed / max, 0, 1) : 0;
  const increment = step ?? (max > 0 ? max / 20 : 1);

  const valueFromEvent = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track || max <= 0) return 0;
      const rect = track.getBoundingClientRect();
      if (rect.width === 0) return 0;
      return clamp((clientX - rect.left) / rect.width, 0, 1) * max;
    },
    [max],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = valueFromEvent(event.clientX);
    setDragging(true);
    setDraft(next);
    if (live) onChange?.(next);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || disabled) return;
    const next = valueFromEvent(event.clientX);
    setDraft(next);
    if (live) onChange?.(next);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const next = valueFromEvent(event.clientX);
    setDragging(false);
    onCommit?.(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = clamp(value + increment, 0, max);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = clamp(value - increment, 0, max);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (live) onChange?.(next);
    onCommit?.(next);
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(displayed)}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      className={`group relative flex items-center py-2 touch-none select-none ${
        disabled ? 'cursor-default opacity-50' : 'cursor-pointer'
      } ${className}`}
    >
      <div className={`relative w-full rounded-full bg-surface-variant overflow-hidden ${trackClassName}`}>
        <div
          className={`absolute inset-0 origin-left ${fillClassName}`}
          style={{
            transform: `scaleX(${ratio})`,
            // Interpolate between the ~10Hz progress ticks, but track the
            // pointer instantly while dragging.
            transitionDuration: dragging ? '0ms' : '120ms',
            transitionTimingFunction: 'linear',
          }}
        />
      </div>
      {showThumb && (
        <span
          aria-hidden="true"
          className={`absolute w-3 h-3 -ml-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(187,195,255,0.6)] transition-opacity ${
            dragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
          }`}
          style={{ left: `${ratio * 100}%` }}
        />
      )}
    </div>
  );
};

export default Slider;
