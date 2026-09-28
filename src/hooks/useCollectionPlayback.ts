import { useCallback } from 'react';
import { isSameSource, usePlayer, usePlayerActions } from '../context/playerStore';
import type { PlaybackSource, Track } from '../types';

export interface CollectionPlayback {
  /** Play the collection, or toggle it if it is already the live queue. */
  play: (tracks: readonly Track[], source: PlaybackSource) => void;
  /** True when this exact collection is playing right now. */
  isPlayingSource: (source: PlaybackSource) => boolean;
}

/**
 * Shared behaviour for every "play this collection" affordance (cards, hero
 * tiles, genre tiles): pressing play on the collection that is already playing
 * pauses it instead of restarting from the top.
 */
export function useCollectionPlayback(): CollectionPlayback {
  const player = usePlayer();
  const actions = usePlayerActions();

  const play = useCallback(
    (tracks: readonly Track[], source: PlaybackSource) => {
      if (tracks.length === 0) return;
      if (isSameSource(player.source, source) && player.hasQueue) actions.toggle();
      else actions.playTracks(tracks, 0, source);
    },
    [player.source, player.hasQueue, actions],
  );

  const isPlayingSource = useCallback(
    (source: PlaybackSource) => player.isPlaying && isSameSource(player.source, source),
    [player.isPlaying, player.source],
  );

  return { play, isPlayingSource };
}
