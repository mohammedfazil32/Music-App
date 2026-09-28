import React from 'react';
import { usePlayer, usePlayerActions } from '../../context/playerStore';
import IconButton from '../ui/IconButton';
import Slider from '../ui/Slider';

export interface VolumeControlProps {
  className?: string;
  /** Tailwind width for the slider track. */
  sliderClassName?: string;
}

function iconFor(volume: number, muted: boolean): string {
  if (muted || volume === 0) return 'volume_off';
  if (volume < 0.5) return 'volume_down';
  return 'volume_up';
}

/** Mute toggle plus a live volume slider, scaled 0-100 for screen readers. */
export const VolumeControl: React.FC<Readonly<VolumeControlProps>> = ({
  className = '',
  sliderClassName = 'w-24',
}) => {
  const { volume, muted } = usePlayer();
  const { setVolume, toggleMute } = usePlayerActions();

  const percent = muted ? 0 : Math.round(volume * 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconButton
        icon={iconFor(volume, muted)}
        label={muted ? 'Unmute' : 'Mute'}
        size="xs"
        active={muted}
        activeClassName="text-primary"
        onClick={toggleMute}
      />
      <Slider
        value={percent}
        max={100}
        live
        step={5}
        ariaLabel="Volume"
        onChange={(next) => setVolume(next / 100)}
        onCommit={(next) => setVolume(next / 100)}
        className={sliderClassName}
        trackClassName="h-1"
        fillClassName="bg-on-surface-variant"
      />
    </div>
  );
};

export default VolumeControl;
