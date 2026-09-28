import { createContext, useContext } from 'react';
import type { Track } from '../types';

/** Chrome-level UI state that more than one component needs to drive. */
export interface UiApi {
  queueOpen: boolean;
  setQueueOpen: (open: boolean) => void;
  toggleQueue: () => void;

  /** When set, the "add to playlist" dialog is open for this track. */
  addToPlaylistTarget: Track | null;
  openAddToPlaylist: (track: Track) => void;
  closeAddToPlaylist: () => void;

  createPlaylistOpen: boolean;
  /** Tracks pre-loaded into a playlist created from this dialog. */
  createPlaylistSeed: string[];
  openCreatePlaylist: (seedTrackIds?: string[]) => void;
  closeCreatePlaylist: () => void;
}

export const UiContext = createContext<UiApi | null>(null);

export function useUi(): UiApi {
  const value = useContext(UiContext);
  if (!value) throw new Error('useUi must be used inside <UiProvider>');
  return value;
}
