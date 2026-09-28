import React from 'react';

export interface EqualizerProps {
  /** Bars animate while true and rest at a low idle height when false. */
  playing: boolean;
  className?: string;
  barClassName?: string;
}

const BARS = [0, 0.18, 0.36, 0.12];

/**
 * Four-bar playback indicator. Used in track rows and the queue to show which
 * item is live — visible at a glance where a colour change alone would not be.
 */
export const Equalizer: React.FC<Readonly<EqualizerProps>> = ({
  playing,
  className = '',
  barClassName = 'bg-primary',
}) => (
  <span className={`flex items-end gap-[2px] h-4 ${className}`} aria-hidden="true">
    {BARS.map((delay, index) => (
      <span
        key={index}
        className={`w-[3px] rounded-full ${barClassName} ${playing ? 'eq-bar' : ''}`}
        style={playing ? { animationDelay: `${delay}s` } : { height: '25%' }}
      />
    ))}
  </span>
);

export default Equalizer;
