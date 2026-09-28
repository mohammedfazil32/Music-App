import { shuffled } from '../lib/catalog';
import { clamp } from '../lib/format';
import type { EngineMode, PlaybackSource, RepeatMode, Track } from '../types';
import { isSameSource, type QueueEntry } from './playerStore';

/**
 * Pure playback state machine.
 *
 * Kept separate from `PlayerProvider` so that queue behaviour — advance, wrap,
 * repeat, shuffle, reorder, removal — is expressed as plain data in and data
 * out, with no reference to the audio element or to React. The provider's job
 * is only to push the resulting state into the engine.
 */

export interface PlayerState {
  /** The queue in its source order — restored when shuffle is switched off. */
  order: QueueEntry[];
  /** The order actually played (equals `order` unless shuffled). */
  queue: QueueEntry[];
  index: number;
  isPlaying: boolean;
  isBuffering: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  source: PlaybackSource | null;
  mode: EngineMode;
  errored: boolean;
  /** Bumped to force a reload of the same entry (replay, repeat-one, restore). */
  loadToken: number;
  /** Position to resume from on the next load. */
  startAt: number;
}

export interface EngineStatusPatch {
  isPlaying: boolean;
  isBuffering: boolean;
  mode: EngineMode;
  errored: boolean;
}

export type PlayerAction =
  | { type: 'PLAY_LIST'; tracks: readonly Track[]; index: number; source: PlaybackSource; forceShuffle?: boolean }
  | { type: 'TOGGLE' }
  | { type: 'PAUSE' }
  | { type: 'PLAY_AT'; index: number }
  | { type: 'NEXT'; auto: boolean }
  | { type: 'PREVIOUS' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'CYCLE_REPEAT' }
  | { type: 'SET_VOLUME'; value: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'QUEUE_NEXT'; track: Track }
  | { type: 'QUEUE_LAST'; track: Track }
  | { type: 'QUEUE_REMOVE'; key: string }
  | { type: 'QUEUE_MOVE'; from: number; to: number }
  | { type: 'QUEUE_CLEAR' }
  | { type: 'ENGINE_STATUS'; status: EngineStatusPatch }
  | { type: 'RESTORE'; patch: Partial<PlayerState> };

export const INITIAL_PLAYER_STATE: PlayerState = {
  order: [],
  queue: [],
  index: 0,
  isPlaying: false,
  isBuffering: false,
  shuffle: false,
  repeat: 'off',
  volume: 0.8,
  muted: false,
  source: null,
  mode: 'stream',
  errored: false,
  loadToken: 0,
  startAt: 0,
};

let sequence = 0;

/**
 * Wraps a track in a queue slot with a unique key, so the same track can appear
 * in a queue more than once and still be reordered or removed individually.
 */
export function entryFor(track: Track): QueueEntry {
  sequence += 1;
  return { key: `${track.id}#${sequence}`, track };
}

/** Apply a patch and force the current entry to reload from the top. */
function reload(state: PlayerState, patch: Partial<PlayerState>): PlayerState {
  return { ...state, ...patch, startAt: 0, loadToken: state.loadToken + 1 };
}

const REPEAT_CYCLE: RepeatMode[] = ['off', 'all', 'one'];

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'PLAY_LIST': {
      if (action.tracks.length === 0) return state;
      const target = action.tracks[clamp(action.index, 0, action.tracks.length - 1)];
      const current = state.queue[state.index];
      // Re-triggering the same track from the same collection is a play/pause.
      if (current && current.track.id === target.id && isSameSource(state.source, action.source)) {
        return { ...state, isPlaying: !state.isPlaying };
      }

      const shuffle = action.forceShuffle ?? state.shuffle;
      const order = action.tracks.map(entryFor);
      const startIndex = clamp(action.index, 0, order.length - 1);
      const start = order[startIndex];
      const queue = shuffle ? [start, ...shuffled(order.filter((entry) => entry.key !== start.key))] : order;

      return reload(state, {
        order,
        queue,
        index: shuffle ? 0 : startIndex,
        shuffle,
        source: action.source,
        isPlaying: true,
        errored: false,
      });
    }

    case 'TOGGLE':
      if (state.queue.length === 0) return state;
      return { ...state, isPlaying: !state.isPlaying };

    case 'PAUSE':
      return state.isPlaying ? { ...state, isPlaying: false } : state;

    case 'PLAY_AT': {
      if (state.queue.length === 0) return state;
      const index = clamp(action.index, 0, state.queue.length - 1);
      if (index === state.index) return { ...state, isPlaying: !state.isPlaying };
      return reload(state, { index, isPlaying: true });
    }

    case 'NEXT': {
      if (state.queue.length === 0) return state;
      // Repeat-one only loops on natural track end, never on an explicit skip.
      if (action.auto && state.repeat === 'one') {
        return reload(state, { isPlaying: true });
      }
      const last = state.queue.length - 1;
      if (state.index < last) return reload(state, { index: state.index + 1, isPlaying: true });
      if (state.repeat === 'all' || !action.auto) return reload(state, { index: 0, isPlaying: true });
      // End of the queue with repeat off: park at the top of the last track.
      return reload(state, { isPlaying: false });
    }

    case 'PREVIOUS': {
      if (state.queue.length === 0) return state;
      if (state.index > 0) return reload(state, { index: state.index - 1, isPlaying: true });
      if (state.repeat === 'all') return reload(state, { index: state.queue.length - 1, isPlaying: true });
      return reload(state, { isPlaying: true });
    }

    case 'TOGGLE_SHUFFLE': {
      const current = state.queue[state.index];
      if (!current) return { ...state, shuffle: !state.shuffle };
      if (state.shuffle) {
        // Back to source order, holding position on the current track.
        const index = state.order.findIndex((entry) => entry.key === current.key);
        return { ...state, shuffle: false, queue: state.order, index: index === -1 ? 0 : index };
      }
      const rest = shuffled(state.order.filter((entry) => entry.key !== current.key));
      return { ...state, shuffle: true, queue: [current, ...rest], index: 0 };
    }

    case 'CYCLE_REPEAT': {
      const next = REPEAT_CYCLE[(REPEAT_CYCLE.indexOf(state.repeat) + 1) % REPEAT_CYCLE.length];
      return { ...state, repeat: next };
    }

    case 'SET_VOLUME': {
      const value = clamp(action.value, 0, 1);
      return { ...state, volume: value, muted: value === 0 ? state.muted : false };
    }

    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted };

    case 'QUEUE_NEXT': {
      const entry = entryFor(action.track);
      if (state.queue.length === 0) {
        return reload(state, {
          order: [entry],
          queue: [entry],
          index: 0,
          isPlaying: true,
          source: { kind: 'queue', title: 'Queue' },
        });
      }
      const queue = [...state.queue];
      queue.splice(state.index + 1, 0, entry);
      const current = state.queue[state.index];
      const orderPos = state.order.findIndex((item) => item.key === current.key);
      const order = [...state.order];
      order.splice(orderPos === -1 ? order.length : orderPos + 1, 0, entry);
      return { ...state, queue, order };
    }

    case 'QUEUE_LAST': {
      const entry = entryFor(action.track);
      if (state.queue.length === 0) {
        return reload(state, {
          order: [entry],
          queue: [entry],
          index: 0,
          isPlaying: true,
          source: { kind: 'queue', title: 'Queue' },
        });
      }
      return { ...state, queue: [...state.queue, entry], order: [...state.order, entry] };
    }

    case 'QUEUE_REMOVE': {
      const position = state.queue.findIndex((entry) => entry.key === action.key);
      if (position === -1) return state;
      const queue = state.queue.filter((_, i) => i !== position);
      const order = state.order.filter((entry) => entry.key !== action.key);
      if (queue.length === 0) {
        return reload(state, { order: [], queue: [], index: 0, isPlaying: false, source: null });
      }
      if (position < state.index) return { ...state, queue, order, index: state.index - 1 };
      if (position > state.index) return { ...state, queue, order };
      // Removed the playing entry: the next one slides into its place.
      return reload(state, { queue, order, index: Math.min(state.index, queue.length - 1) });
    }

    case 'QUEUE_MOVE': {
      const { from, to } = action;
      if (from === to) return state;
      if (from < 0 || to < 0 || from >= state.queue.length || to >= state.queue.length) return state;
      const current = state.queue[state.index];
      const queue = [...state.queue];
      const [moved] = queue.splice(from, 1);
      queue.splice(to, 0, moved);
      const index = current ? queue.findIndex((entry) => entry.key === current.key) : state.index;
      return { ...state, queue, index: index === -1 ? state.index : index };
    }

    case 'QUEUE_CLEAR': {
      const current = state.queue[state.index];
      if (!current) return state;
      return { ...state, queue: [current], order: [current], index: 0 };
    }

    case 'ENGINE_STATUS': {
      const { isPlaying, isBuffering, mode, errored } = action.status;
      if (
        state.isPlaying === isPlaying &&
        state.isBuffering === isBuffering &&
        state.mode === mode &&
        state.errored === errored
      ) {
        return state;
      }
      return { ...state, isPlaying, isBuffering, mode, errored };
    }

    case 'RESTORE':
      return { ...state, ...action.patch, loadToken: state.loadToken + 1 };

    default:
      return state;
  }
}
