import { createContext, useContext } from 'react';
import type { Album, Artist, Playlist, Track } from '../types';

/** Everything the listener has personally accumulated. Persisted to localStorage. */
export interface LibraryState {
  likedTrackIds: string[];
  /** ISO timestamp of when each track was liked, for the "Date Added" column. */
  likedAt: Record<string, string>;
  likedAlbumIds: string[];
  followedArtistIds: string[];
  /** User-created playlists only; curated ones live in the catalog. */
  playlists: Playlist[];
  /** Most recent first, capped. */
  recentTrackIds: string[];
  searchHistory: string[];
}

export interface LibraryApi extends LibraryState {
  isTrackLiked: (trackId: string) => boolean;
  toggleTrackLike: (track: Track) => void;
  isAlbumLiked: (albumId: string) => boolean;
  toggleAlbumLike: (album: Album) => void;
  isFollowingArtist: (artistId: string) => boolean;
  toggleFollowArtist: (artist: Artist) => void;

  getUserPlaylist: (playlistId: string) => Playlist | undefined;
  createPlaylist: (title: string, trackIds?: string[]) => Playlist;
  updatePlaylist: (playlistId: string, patch: { title?: string; description?: string }) => void;
  deletePlaylist: (playlistId: string) => void;
  addTracksToPlaylist: (playlistId: string, trackIds: string[]) => number;
  /** Removes by position so duplicated tracks can be removed individually. */
  removeTrackFromPlaylist: (playlistId: string, position: number) => void;
  reorderPlaylist: (playlistId: string, from: number, to: number) => void;

  recordPlay: (trackId: string) => void;
  addSearchTerm: (term: string) => void;
  removeSearchTerm: (term: string) => void;
  clearSearchHistory: () => void;
  resetLibrary: () => void;
}

export const LibraryContext = createContext<LibraryApi | null>(null);

export function useLibrary(): LibraryApi {
  const value = useContext(LibraryContext);
  if (!value) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return value;
}
