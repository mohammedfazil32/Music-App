import { createContext, useContext } from 'react';
import type { EngineMode, PlaybackSource, RepeatMode, Track } from '../types';

/**
 * A queue slot. The `key` exists because the same track can legitimately appear
 * in a queue more than once ("add to queue" twice) — every reorder, removal and
 * React list key is addressed by `key`, never by track id.
 */
export interface QueueEntry {
  key: string;
  track: Track;
}

/** Everything the UI needs about playback except the moving clock. */
export interface PlayerSnapshot {
  queue: QueueEntry[];
  index: number;
  currentTrack: Track | null;
  currentKey: string | null;
  /** Entries after the current one. */
  upNext: QueueEntry[];
  isPlaying: boolean;
  isBuffering: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  source: PlaybackSource | null;
  mode: EngineMode;
  /** True when the stream failed and the generative fallback took over. */
  errored: boolean;
  hasQueue: boolean;
}

export interface PlayerActions {
  /** Replace the queue with `tracks` and start at `startIndex`. */
  playTracks: (tracks: readonly Track[], startIndex: number, source: PlaybackSource) => void;
  /** Play a single track as its own queue. */
  playTrack: (track: Track, source: PlaybackSource) => void;
  /** Turn shuffle on and play the collection from a random position. */
  shufflePlay: (tracks: readonly Track[], source: PlaybackSource) => void;
  toggle: () => void;
  pause: () => void;
  next: () => void;
  /** Restarts the track if more than 3s in, otherwise steps back. */
  previous: () => void;
  playAt: (index: number) => void;
  seekTo: (seconds: number) => void;
  seekBy: (delta: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  queueNext: (track: Track) => void;
  queueLast: (track: Track) => void;
  removeFromQueue: (key: string) => void;
  moveInQueue: (from: number, to: number) => void;
  /** Drops everything except the track that is playing. */
  clearQueue: () => void;
}

export interface Progress {
  currentTime: number;
  duration: number;
}

export const PlayerSnapshotContext = createContext<PlayerSnapshot | null>(null);
export const PlayerActionsContext = createContext<PlayerActions | null>(null);
export const ProgressContext = createContext<Progress>({ currentTime: 0, duration: 0 });

export function usePlayer(): PlayerSnapshot {
  const value = useContext(PlayerSnapshotContext);
  if (!value) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return value;
}

export function usePlayerActions(): PlayerActions {
  const value = useContext(PlayerActionsContext);
  if (!value) throw new Error('usePlayerActions must be used inside <PlayerProvider>');
  return value;
}

/**
 * Subscribe to the playback clock. Kept in its own context because it updates
 * ~10x a second — only components that draw time should consume it.
 */
export function useProgress(): Progress {
  return useContext(ProgressContext);
}

/** True when `track` is the loaded track — used for row highlighting. */
export function isCurrent(snapshot: PlayerSnapshot, trackId: string): boolean {
  return snapshot.currentTrack?.id === trackId;
}

/** True when `track` is loaded *and* actually playing. */
export function isPlayingTrack(snapshot: PlayerSnapshot, trackId: string): boolean {
  return snapshot.isPlaying && snapshot.currentTrack?.id === trackId;
}

/** Whether a source descriptor refers to the same collection. */
export function isSameSource(a: PlaybackSource | null, b: PlaybackSource | null): boolean {
  if (!a || !b) return false;
  return a.kind === b.kind && a.id === b.id;
}
