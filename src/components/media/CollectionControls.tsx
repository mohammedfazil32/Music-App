import React from 'react';
import { isSameSource, usePlayer, usePlayerActions } from '../../context/playerStore';
import type { PlaybackSource, Track } from '../../types';
import IconButton from '../ui/IconButton';
import Menu, { type MenuItem } from '../ui/Menu';

export interface CollectionControlsProps {
  tracks: readonly Track[];
  source: PlaybackSource;
  /** Text on the primary button. */
  playLabel?: string;
  menuItems?: MenuItem[];
  /** Extra controls (like, follow) rendered between shuffle and the menu. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Primary transport for a collection: play/pause, shuffle-play, and overflow.
 *
 * The play button reflects whether *this* collection is the live queue, so
 * returning to an album that is already playing shows a pause state instead of
 * silently restarting it.
 */
export const CollectionControls: React.FC<Readonly<CollectionControlsProps>> = ({
  tracks,
  source,
  playLabel,
  menuItems,
  children,
  className = '',
}) => {
  const player = usePlayer();
  const actions = usePlayerActions();

  const isThisSource = isSameSource(player.source, source) && player.hasQueue;
  const isPlayingThis = isThisSource && player.isPlaying;
  const empty = tracks.length === 0;

  const handlePlay = () => {
    if (empty) return;
    if (isThisSource) actions.toggle();
    else actions.playTracks(tracks, 0, source);
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        type="button"
        onClick={handlePlay}
        disabled={empty}
        aria-label={isPlayingThis ? `Pause ${source.title}` : `Play ${source.title}`}
        className="bg-primary-container text-on-primary-container rounded-full font-bold flex items-center gap-3 px-8 py-4 shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          {isPlayingThis ? 'pause' : 'play_arrow'}
        </span>
        {playLabel && <span>{isPlayingThis ? 'Pause' : playLabel}</span>}
      </button>

      <IconButton
        icon="shuffle"
        label={`Shuffle ${source.title}`}
        size="md"
        variant="tonal"
        disabled={empty}
        active={isThisSource && player.shuffle}
        onClick={() => {
          if (!empty) actions.shufflePlay(tracks, source);
        }}
      />

      {children}

      {menuItems && menuItems.length > 0 && (
        <Menu items={menuItems} label={`More options for ${source.title}`} size="md" />
      )}
    </div>
  );
};

export default CollectionControls;
