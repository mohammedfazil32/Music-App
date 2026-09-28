import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  currentUser,
  seedFollowedArtistIds,
  seedLikedAlbumIds,
  seedLikedTrackIds,
  seedUserPlaylists,
} from '../data/mockData';
import { clearState, loadState, saveState } from '../lib/storage';
import type { Album, Artist, Playlist, Track } from '../types';
import { LibraryContext, type LibraryApi, type LibraryState } from './libraryStore';
import { useToast } from './toastStore';

export interface LibraryProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'library';
const MAX_RECENT = 24;
const MAX_SEARCH_HISTORY = 8;

const DAY_MS = 86_400_000;

/** Seed "liked" timestamps relative to first load so the dates read naturally. */
const SEED_LIKED_AT: Record<string, string> = Object.fromEntries(
  seedLikedTrackIds.map((id, index) => [id, new Date(Date.now() - (index * 3 + 2) * DAY_MS).toISOString()]),
);

const INITIAL_STATE: LibraryState = {
  likedTrackIds: seedLikedTrackIds,
  likedAt: SEED_LIKED_AT,
  likedAlbumIds: seedLikedAlbumIds,
  followedArtistIds: seedFollowedArtistIds,
  playlists: seedUserPlaylists,
  recentTrackIds: [],
  searchHistory: [],
};

/** Adds `value` if absent, removes it if present. */
function toggleIn(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [value, ...list];
}

/**
 * Owns liked tracks, follows, user playlists, play history and search history,
 * and mirrors all of it to localStorage on every change.
 */
export const LibraryProvider: React.FC<Readonly<LibraryProviderProps>> = ({ children }) => {
  const { notify } = useToast();
  const [state, setState] = useState<LibraryState>(() => loadState(STORAGE_KEY, INITIAL_STATE));

  // Skip the very first write so a fresh visitor's seed data isn't persisted
  // before they have actually interacted with anything.
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveState(STORAGE_KEY, state);
  }, [state]);

  const isTrackLiked = useCallback(
    (trackId: string) => state.likedTrackIds.includes(trackId),
    [state.likedTrackIds],
  );

  const toggleTrackLike = useCallback(
    (track: Track) => {
      let liked = false;
      setState((current) => {
        liked = !current.likedTrackIds.includes(track.id);
        const likedAt = { ...current.likedAt };
        if (liked) likedAt[track.id] = new Date().toISOString();
        else delete likedAt[track.id];
        return { ...current, likedTrackIds: toggleIn(current.likedTrackIds, track.id), likedAt };
      });
      notify(liked ? `Added "${track.title}" to Liked Songs` : `Removed "${track.title}" from Liked Songs`, {
        icon: liked ? 'favorite' : 'heart_minus',
      });
    },
    [notify],
  );

  const isAlbumLiked = useCallback(
    (albumId: string) => state.likedAlbumIds.includes(albumId),
    [state.likedAlbumIds],
  );

  const toggleAlbumLike = useCallback(
    (album: Album) => {
      let liked = false;
      setState((current) => {
        liked = !current.likedAlbumIds.includes(album.id);
        return { ...current, likedAlbumIds: toggleIn(current.likedAlbumIds, album.id) };
      });
      notify(liked ? `Saved "${album.title}" to your library` : `Removed "${album.title}" from your library`, {
        icon: liked ? 'library_add_check' : 'library_add',
      });
    },
    [notify],
  );

  const isFollowingArtist = useCallback(
    (artistId: string) => state.followedArtistIds.includes(artistId),
    [state.followedArtistIds],
  );

  const toggleFollowArtist = useCallback(
    (artist: Artist) => {
      let following = false;
      setState((current) => {
        following = !current.followedArtistIds.includes(artist.id);
        return { ...current, followedArtistIds: toggleIn(current.followedArtistIds, artist.id) };
      });
      notify(following ? `Following ${artist.name}` : `Unfollowed ${artist.name}`, {
        icon: following ? 'person_check' : 'person_remove',
      });
    },
    [notify],
  );

  const getUserPlaylist = useCallback(
    (playlistId: string) => state.playlists.find((playlist) => playlist.id === playlistId),
    [state.playlists],
  );

  const createPlaylist = useCallback((title: string, trackIds: string[] = []): Playlist => {
    const playlist: Playlist = {
      id: `pl-user-${Date.now().toString(36)}`,
      title: title.trim() || 'Untitled playlist',
      description: '',
      artwork: '',
      trackIds,
      createdAt: new Date().toISOString(),
      isPublic: false,
      owner: currentUser.name,
      editable: true,
    };
    setState((current) => ({ ...current, playlists: [playlist, ...current.playlists] }));
    return playlist;
  }, []);

  const updatePlaylist = useCallback(
    (playlistId: string, patch: { title?: string; description?: string }) => {
      setState((current) => ({
        ...current,
        playlists: current.playlists.map((playlist) =>
          playlist.id === playlistId
            ? {
                ...playlist,
                title: patch.title?.trim() ? patch.title.trim() : playlist.title,
                description: patch.description ?? playlist.description,
              }
            : playlist,
        ),
      }));
    },
    [],
  );

  const deletePlaylist = useCallback((playlistId: string) => {
    setState((current) => ({
      ...current,
      playlists: current.playlists.filter((playlist) => playlist.id !== playlistId),
    }));
  }, []);

  /** Returns how many tracks were actually added (duplicates are skipped). */
  const addTracksToPlaylist = useCallback((playlistId: string, trackIds: string[]): number => {
    let added = 0;
    setState((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        const fresh = trackIds.filter((id) => !playlist.trackIds.includes(id));
        added = fresh.length;
        return fresh.length > 0 ? { ...playlist, trackIds: [...playlist.trackIds, ...fresh] } : playlist;
      }),
    }));
    return added;
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, position: number) => {
    setState((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, trackIds: playlist.trackIds.filter((_, index) => index !== position) }
          : playlist,
      ),
    }));
  }, []);

  const reorderPlaylist = useCallback((playlistId: string, from: number, to: number) => {
    setState((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        if (from === to || from < 0 || to < 0 || from >= playlist.trackIds.length || to >= playlist.trackIds.length) {
          return playlist;
        }
        const next = [...playlist.trackIds];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...playlist, trackIds: next };
      }),
    }));
  }, []);

  const recordPlay = useCallback((trackId: string) => {
    setState((current) => {
      if (current.recentTrackIds[0] === trackId) return current;
      const next = [trackId, ...current.recentTrackIds.filter((id) => id !== trackId)].slice(0, MAX_RECENT);
      return { ...current, recentTrackIds: next };
    });
  }, []);

  const addSearchTerm = useCallback((term: string) => {
    const value = term.trim();
    if (value.length < 2) return;
    setState((current) => ({
      ...current,
      searchHistory: [value, ...current.searchHistory.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(
        0,
        MAX_SEARCH_HISTORY,
      ),
    }));
  }, []);

  const removeSearchTerm = useCallback((term: string) => {
    setState((current) => ({
      ...current,
      searchHistory: current.searchHistory.filter((item) => item !== term),
    }));
  }, []);

  const clearSearchHistory = useCallback(() => {
    setState((current) => ({ ...current, searchHistory: [] }));
  }, []);

  const resetLibrary = useCallback(() => {
    clearState(STORAGE_KEY);
    setState(INITIAL_STATE);
    notify('Library reset to defaults', { icon: 'restart_alt' });
  }, [notify]);

  const api = useMemo<LibraryApi>(
    () => ({
      ...state,
      isTrackLiked,
      toggleTrackLike,
      isAlbumLiked,
      toggleAlbumLike,
      isFollowingArtist,
      toggleFollowArtist,
      getUserPlaylist,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addTracksToPlaylist,
      removeTrackFromPlaylist,
      reorderPlaylist,
      recordPlay,
      addSearchTerm,
      removeSearchTerm,
      clearSearchHistory,
      resetLibrary,
    }),
    [
      state,
      isTrackLiked,
      toggleTrackLike,
      isAlbumLiked,
      toggleAlbumLike,
      isFollowingArtist,
      toggleFollowArtist,
      getUserPlaylist,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addTracksToPlaylist,
      removeTrackFromPlaylist,
      reorderPlaylist,
      recordPlay,
      addSearchTerm,
      removeSearchTerm,
      clearSearchHistory,
      resetLibrary,
    ],
  );

  return <LibraryContext.Provider value={api}>{children}</LibraryContext.Provider>;
};

export default LibraryProvider;
