import React from 'react';
import { usePlayer, usePlayerActions } from '../../context/playerStore';
import IconButton from '../ui/IconButton';

export interface PlayerControlsProps {
  /** `bar` is the compact footer transport; `page` is the large Now Playing one. */
  size?: 'bar' | 'page';
  className?: string;
}

const REPEAT_LABEL = {
  off: 'Repeat off — click to repeat the queue',
  all: 'Repeating the queue — click to repeat one track',
  one: 'Repeating one track — click to turn repeat off',
} as const;

/** Shuffle / previous / play / next / repeat, shared by both player surfaces. */
export const PlayerControls: React.FC<Readonly<PlayerControlsProps>> = ({ size = 'bar', className = '' }) => {
  const player = usePlayer();
  const actions = usePlayerActions();

  const large = size === 'page';
  const idle = !player.hasQueue;

  return (
    <div className={`flex items-center ${large ? 'gap-10' : 'gap-4'} ${className}`}>
      <IconButton
        icon="shuffle"
        label={player.shuffle ? 'Shuffle on — click to turn off' : 'Shuffle off — click to turn on'}
        size={large ? 'md' : 'sm'}
        active={player.shuffle}
        disabled={idle}
        onClick={actions.toggleShuffle}
      />
      <IconButton
        icon="skip_previous"
        label="Previous track"
        size={large ? 'lg' : 'sm'}
        disabled={idle}
        onClick={actions.previous}
        className={large ? 'text-on-surface' : ''}
      />

      <button
        type="button"
        onClick={actions.toggle}
        disabled={idle}
        aria-label={player.isPlaying ? 'Pause' : 'Play'}
        className={`${
          large ? 'w-20 h-20' : 'w-10 h-10'
        } bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-lg shadow-primary-container/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0`}
      >
        {player.isBuffering ? (
          <span className={`material-symbols-outlined animate-spin ${large ? 'text-4xl' : 'text-xl'}`}>
            progress_activity
          </span>
        ) : (
          <span
            className={`material-symbols-outlined ${large ? 'text-5xl' : 'text-xl'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {player.isPlaying ? 'pause' : 'play_arrow'}
          </span>
        )}
      </button>

      <IconButton
        icon="skip_next"
        label="Next track"
        size={large ? 'lg' : 'sm'}
        disabled={idle}
        onClick={actions.next}
        className={large ? 'text-on-surface' : ''}
      />
      <IconButton
        icon={player.repeat === 'one' ? 'repeat_one' : 'repeat'}
        label={REPEAT_LABEL[player.repeat]}
        size={large ? 'md' : 'sm'}
        active={player.repeat !== 'off'}
        activeClassName="text-tertiary"
        disabled={idle}
        onClick={actions.cycleRepeat}
      />
    </div>
  );
};

export default PlayerControls;
