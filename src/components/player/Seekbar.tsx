import React from 'react';
import { usePlayer, usePlayerActions, useProgress } from '../../context/playerStore';
import { formatTime } from '../../lib/format';
import Slider from '../ui/Slider';

export interface SeekbarProps {
  /** `inline` puts the timestamps either side; `stacked` puts them underneath. */
  layout?: 'inline' | 'stacked';
  className?: string;
}

/**
 * Scrub bar for the current track.
 *
 * One of the few components that subscribes to the progress context, which
 * ticks ~10x a second — the gradient fill interpolates the gaps in CSS.
 */
export const Seekbar: React.FC<Readonly<SeekbarProps>> = ({ layout = 'inline', className = '' }) => {
  const { currentTime, duration } = useProgress();
  const { seekTo } = usePlayerActions();
  const player = usePlayer();

  // Fall back to the catalog duration until real metadata arrives.
  const total = duration > 0 ? duration : (player.currentTrack?.duration ?? 0);
  const disabled = !player.hasQueue;

  const elapsed = (
    <span className="text-[10px] font-bold text-on-surface-variant tabular-nums">{formatTime(currentTime)}</span>
  );
  const remaining = (
    <span className="text-[10px] font-bold text-on-surface-variant tabular-nums">{formatTime(total)}</span>
  );

  const slider = (
    <Slider
      value={currentTime}
      max={total}
      onCommit={seekTo}
      ariaLabel="Seek through the current track"
      step={5}
      disabled={disabled}
      className="flex-grow"
      fillClassName="bg-gradient-to-r from-primary to-tertiary shadow-[0_0_8px_rgba(60,227,106,0.5)]"
    />
  );

  if (layout === 'stacked') {
    return (
      <div className={className}>
        {slider}
        <div className="flex justify-between uppercase tracking-widest">
          {elapsed}
          {remaining}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="w-9 text-right">{elapsed}</span>
      {slider}
      <span className="w-9">{remaining}</span>
    </div>
  );
};

export default Seekbar;
