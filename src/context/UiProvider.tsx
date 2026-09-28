import React, { useCallback, useMemo, useState } from 'react';
import type { Track } from '../types';
import { UiContext, type UiApi } from './uiStore';

export interface UiProviderProps {
  children: React.ReactNode;
}

export const UiProvider: React.FC<Readonly<UiProviderProps>> = ({ children }) => {
  const [queueOpen, setQueueOpen] = useState(false);
  const [addToPlaylistTarget, setAddToPlaylistTarget] = useState<Track | null>(null);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [createPlaylistSeed, setCreatePlaylistSeed] = useState<string[]>([]);

  const openAddToPlaylist = useCallback((track: Track) => setAddToPlaylistTarget(track), []);
  const closeAddToPlaylist = useCallback(() => setAddToPlaylistTarget(null), []);

  const openCreatePlaylist = useCallback((seedTrackIds: string[] = []) => {
    setCreatePlaylistSeed(seedTrackIds);
    setCreatePlaylistOpen(true);
    setAddToPlaylistTarget(null);
  }, []);

  const closeCreatePlaylist = useCallback(() => {
    setCreatePlaylistOpen(false);
    setCreatePlaylistSeed([]);
  }, []);

  const toggleQueue = useCallback(() => setQueueOpen((open) => !open), []);

  const api = useMemo<UiApi>(
    () => ({
      queueOpen,
      setQueueOpen,
      toggleQueue,
      addToPlaylistTarget,
      openAddToPlaylist,
      closeAddToPlaylist,
      createPlaylistOpen,
      createPlaylistSeed,
      openCreatePlaylist,
      closeCreatePlaylist,
    }),
    [
      queueOpen,
      toggleQueue,
      addToPlaylistTarget,
      openAddToPlaylist,
      closeAddToPlaylist,
      createPlaylistOpen,
      createPlaylistSeed,
      openCreatePlaylist,
      closeCreatePlaylist,
    ],
  );

  return <UiContext.Provider value={api}>{children}</UiContext.Provider>;
};

export default UiProvider;
