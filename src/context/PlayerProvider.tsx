import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { PlaybackEngine } from '../lib/audio/engine';
import { getTrack } from '../lib/catalog';
import { clamp } from '../lib/format';
import { loadState, saveState } from '../lib/storage';
import type { PlaybackSource, RepeatMode, Track } from '../types';
import { useLibrary } from './libraryStore';
import {
  INITIAL_PLAYER_STATE,
  entryFor,
  playerReducer,
  type PlayerState,
} from './playerReducer';
import {
  PlayerActionsContext,
  PlayerSnapshotContext,
  ProgressContext,
  type PlayerActions,
  type PlayerSnapshot,
  type Progress,
} from './playerStore';

export interface PlayerProviderProps {
  children: React.ReactNode;
}

/** Shape persisted to localStorage between visits. */
interface SavedSession {
  orderTrackIds?: string[];
  /** For each queue slot, its index into `order`. Preserves an exact shuffle. */
  queuePositions?: number[];
  index?: number;
  position?: number;
  source?: PlaybackSource | null;
  shuffle?: boolean;
  repeat?: RepeatMode;
  volume?: number;
  muted?: boolean;
}

const SESSION_KEY = 'session';
/** Pressing previous within this many seconds steps back; later it restarts. */
const RESTART_THRESHOLD = 3;
/** How often the playhead is checkpointed while audio is running. */
const CHECKPOINT_MS = 5000;

/**
 * Owns all playback state and is the only place that talks to the audio engine.
 *
 * State flows one way: actions dispatch into `playerReducer`, and effects push
 * the resulting state into the imperative engine. The engine reports back
 * through `ENGINE_STATUS` (autoplay blocked, buffering, stream failure, track
 * ended), so the UI and the audio element can never drift apart.
 *
 * The playback clock lives in a separate context because it ticks ~10x a
 * second; `children` is a stable element, so only components that read the
 * progress context re-render at that rate.
 */
export const PlayerProvider: React.FC<Readonly<PlayerProviderProps>> = ({ children }) => {
  const { recordPlay } = useLibrary();
  const [state, dispatch] = useReducer(playerReducer, INITIAL_PLAYER_STATE);
  const [progress, setProgress] = useState<Progress>({ currentTime: 0, duration: 0 });

  const engineRef = useRef<PlaybackEngine | null>(null);
  const getEngine = useCallback((): PlaybackEngine => {
    if (!engineRef.current) engineRef.current = new PlaybackEngine();
    return engineRef.current;
  }, []);

  const currentEntry = state.queue[state.index] ?? null;
  const currentTrack = currentEntry?.track ?? null;

  // Mirrors for callbacks that must read the latest value without
  // re-subscribing (autoplay intent, previous-vs-restart, persistence). Each
  // mirror effect is declared *before* the effects that read it, so the value
  // is already current when those run.
  const intentRef = useRef(state.isPlaying);
  const stateRef = useRef(state);
  const progressRef = useRef(progress);

  const loadedKeyRef = useRef('');
  const skipTransportRef = useRef(false);

  // --- engine wiring (declared first so it is re-created before any load) ---
  useEffect(() => {
    const engine = getEngine();
    engine.onProgress = (currentTime, duration) => setProgress({ currentTime, duration });
    engine.onStatus = (status) => dispatch({ type: 'ENGINE_STATUS', status });
    engine.onEnded = () => dispatch({ type: 'NEXT', auto: true });
    return () => {
      engine.dispose();
      engineRef.current = null;
      // Force the next load: this engine instance no longer holds a source.
      loadedKeyRef.current = '';
    };
  }, [getEngine]);

  // --- state mirrors ---
  useEffect(() => {
    intentRef.current = state.isPlaying;
  }, [state.isPlaying]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // --- load the current entry ---
  useEffect(() => {
    if (!currentEntry) {
      loadedKeyRef.current = '';
      return;
    }
    const key = `${currentEntry.key}:${state.loadToken}`;
    if (loadedKeyRef.current === key) return;
    loadedKeyRef.current = key;
    // The load itself honours the play intent, so the transport effect below
    // must not also fire for this commit. `load` emits its own progress update.
    skipTransportRef.current = true;
    getEngine().load(currentEntry.track, { autoplay: intentRef.current, startAt: state.startAt });
  }, [currentEntry, state.loadToken, state.startAt, getEngine]);

  // --- play / pause ---
  useEffect(() => {
    if (skipTransportRef.current) {
      skipTransportRef.current = false;
      return;
    }
    const engine = getEngine();
    if (state.isPlaying) void engine.play();
    else engine.pause();
  }, [state.isPlaying, getEngine]);

  useEffect(() => {
    getEngine().setVolume(state.volume);
  }, [state.volume, getEngine]);

  useEffect(() => {
    getEngine().setMuted(state.muted);
  }, [state.muted, getEngine]);

  // --- actions (stable: each one only dispatches, or seeks the engine) ---
  const actions = useMemo<PlayerActions>(
    () => ({
      playTracks: (tracks, startIndex, source) =>
        dispatch({ type: 'PLAY_LIST', tracks, index: startIndex, source }),
      playTrack: (track, source) => dispatch({ type: 'PLAY_LIST', tracks: [track], index: 0, source }),
      shufflePlay: (tracks, source) =>
        dispatch({
          type: 'PLAY_LIST',
          tracks,
          index: tracks.length > 0 ? Math.floor(Math.random() * tracks.length) : 0,
          source,
          forceShuffle: true,
        }),
      toggle: () => dispatch({ type: 'TOGGLE' }),
      pause: () => dispatch({ type: 'PAUSE' }),
      next: () => dispatch({ type: 'NEXT', auto: false }),
      previous: () => {
        if (progressRef.current.currentTime > RESTART_THRESHOLD) {
          getEngine().seek(0);
          setProgress((current) => ({ ...current, currentTime: 0 }));
          return;
        }
        dispatch({ type: 'PREVIOUS' });
      },
      playAt: (index) => dispatch({ type: 'PLAY_AT', index }),
      seekTo: (seconds) => {
        getEngine().seek(seconds);
        setProgress((current) => ({ ...current, currentTime: Math.max(0, seconds) }));
      },
      seekBy: (delta) => {
        const next = clamp(progressRef.current.currentTime + delta, 0, progressRef.current.duration || 0);
        getEngine().seek(next);
        setProgress((current) => ({ ...current, currentTime: next }));
      },
      setVolume: (value) => dispatch({ type: 'SET_VOLUME', value }),
      toggleMute: () => dispatch({ type: 'TOGGLE_MUTE' }),
      toggleShuffle: () => dispatch({ type: 'TOGGLE_SHUFFLE' }),
      cycleRepeat: () => dispatch({ type: 'CYCLE_REPEAT' }),
      queueNext: (track) => dispatch({ type: 'QUEUE_NEXT', track }),
      queueLast: (track) => dispatch({ type: 'QUEUE_LAST', track }),
      removeFromQueue: (key) => dispatch({ type: 'QUEUE_REMOVE', key }),
      moveInQueue: (from, to) => dispatch({ type: 'QUEUE_MOVE', from, to }),
      clearQueue: () => dispatch({ type: 'QUEUE_CLEAR' }),
    }),
    [getEngine],
  );

  // --- restore the previous session once ---
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const saved = loadState<SavedSession | null>(SESSION_KEY, null);
    if (!saved) return;

    const patch: Partial<PlayerState> = {};
    if (typeof saved.volume === 'number') patch.volume = clamp(saved.volume, 0, 1);
    if (typeof saved.muted === 'boolean') patch.muted = saved.muted;
    if (typeof saved.shuffle === 'boolean') patch.shuffle = saved.shuffle;
    if (saved.repeat === 'all' || saved.repeat === 'one') patch.repeat = saved.repeat;

    const ids = Array.isArray(saved.orderTrackIds) ? saved.orderTrackIds : [];
    const order = ids
      .map((id) => getTrack(id))
      .filter((track): track is Track => Boolean(track))
      .map(entryFor);

    // Ignore a stale queue whose tracks are no longer all in the catalog.
    if (order.length > 0 && order.length === ids.length) {
      const positions =
        Array.isArray(saved.queuePositions) && saved.queuePositions.length === order.length
          ? saved.queuePositions
          : order.map((_, i) => i);
      const queue = positions.map((position) => order[position]).filter(Boolean);
      if (queue.length === order.length) {
        patch.order = order;
        patch.queue = queue;
        patch.index = clamp(saved.index ?? 0, 0, queue.length - 1);
        patch.source = saved.source ?? null;
        patch.startAt = Math.max(0, saved.position ?? 0);
        // Browsers block autoplay without a gesture: always resume paused.
        patch.isPlaying = false;
      }
    }

    if (Object.keys(patch).length > 0) dispatch({ type: 'RESTORE', patch });
  }, []);

  // --- persistence ---
  const persist = useCallback(() => {
    const current = stateRef.current;
    if (current.order.length === 0) return;
    const positionOf = new Map(current.order.map((entry, index) => [entry.key, index]));
    const session: SavedSession = {
      orderTrackIds: current.order.map((entry) => entry.track.id),
      queuePositions: current.queue.map((entry) => positionOf.get(entry.key) ?? 0),
      index: current.index,
      position: progressRef.current.currentTime,
      source: current.source,
      shuffle: current.shuffle,
      repeat: current.repeat,
      volume: current.volume,
      muted: current.muted,
    };
    saveState(SESSION_KEY, session);
  }, []);

  useEffect(() => {
    persist();
  }, [
    persist,
    state.order,
    state.queue,
    state.index,
    state.source,
    state.shuffle,
    state.repeat,
    state.volume,
    state.muted,
  ]);

  useEffect(() => {
    if (!state.isPlaying) return;
    const timer = window.setInterval(persist, CHECKPOINT_MS);
    return () => window.clearInterval(timer);
  }, [state.isPlaying, persist]);

  // --- side effects driven by the current track ---
  useEffect(() => {
    if (state.isPlaying && currentTrack) recordPlay(currentTrack.id);
  }, [state.isPlaying, currentTrack, recordPlay]);

  useEffect(() => {
    document.title =
      currentTrack && state.isPlaying
        ? `${currentTrack.title} · ${currentTrack.artist}`
        : 'The Sonic Curator | Premium Music Experience';
  }, [currentTrack, state.isPlaying]);

  // --- OS media keys / lock screen ---
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    if (currentTrack) {
      session.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [{ src: currentTrack.artwork, sizes: '512x512', type: 'image/jpeg' }],
      });
    }
    session.playbackState = state.isPlaying ? 'playing' : 'paused';
  }, [currentTrack, state.isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => actions.toggle()],
      ['pause', () => actions.pause()],
      ['nexttrack', () => actions.next()],
      ['previoustrack', () => actions.previous()],
      ['seekbackward', () => actions.seekBy(-10)],
      ['seekforward', () => actions.seekBy(10)],
    ];
    handlers.forEach(([action, handler]) => {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Unsupported action in this browser — ignore.
      }
    });
    return () => {
      handlers.forEach(([action]) => {
        try {
          session.setActionHandler(action, null);
        } catch {
          // As above.
        }
      });
    };
  }, [actions]);

  const snapshot = useMemo<PlayerSnapshot>(
    () => ({
      queue: state.queue,
      index: state.index,
      currentTrack,
      currentKey: currentEntry?.key ?? null,
      upNext: state.queue.slice(state.index + 1),
      isPlaying: state.isPlaying,
      isBuffering: state.isBuffering,
      shuffle: state.shuffle,
      repeat: state.repeat,
      volume: state.volume,
      muted: state.muted,
      source: state.source,
      mode: state.mode,
      errored: state.errored,
      hasQueue: state.queue.length > 0,
    }),
    [
      state.queue,
      state.index,
      state.isPlaying,
      state.isBuffering,
      state.shuffle,
      state.repeat,
      state.volume,
      state.muted,
      state.source,
      state.mode,
      state.errored,
      currentTrack,
      currentEntry,
    ],
  );

  return (
    <PlayerActionsContext.Provider value={actions}>
      <PlayerSnapshotContext.Provider value={snapshot}>
        <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>
      </PlayerSnapshotContext.Provider>
    </PlayerActionsContext.Provider>
  );
};

export default PlayerProvider;
