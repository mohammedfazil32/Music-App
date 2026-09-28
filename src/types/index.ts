/**
 * Domain types for The Sonic Curator.
 *
 * The catalog is relational: tracks reference their album and artist by id so
 * that every surface (album page, artist page, playlist, search) can be built
 * from the same source of truth in `src/data/mockData.ts`.
 */

export interface LyricLine {
  /** Start time of the line, in seconds. */
  time: number;
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  /**
   * Length in seconds, measured from the source MP3, so lists and the seekbar
   * agree before metadata loads. The engine still prefers the real value once
   * `loadedmetadata` fires, and the synth fallback uses this figure.
   */
  duration: number;
  artwork: string;
  genre: string;
  year: number;
  /** Streaming URL. */
  src: string;
  plays: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artwork: string;
  year: number;
  genre: string;
  description: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
  genres: string[];
  monthlyListeners: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  artwork: string;
  trackIds: string[];
  /** ISO date string. */
  createdAt: string;
  isPublic: boolean;
  owner: string;
  /** User-created playlists can be renamed, reordered and deleted. */
  editable: boolean;
}

export interface Genre {
  id: string;
  name: string;
  image: string;
  /** Tailwind gradient start class, e.g. `from-indigo-900/60`. */
  gradient: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type PlaybackSourceKind =
  | 'playlist'
  | 'album'
  | 'artist'
  | 'liked'
  | 'genre'
  | 'search'
  | 'queue'
  | 'mix';

/** Where the current queue came from, so the UI can label and link back to it. */
export interface PlaybackSource {
  kind: PlaybackSourceKind;
  id?: string;
  title: string;
  href?: string;
}

/**
 * `stream` plays the track's real audio URL. `synth` is the offline fallback:
 * a generative Web Audio pad used when the network blocks or fails, so the
 * transport, progress and queue stay demonstrably functional.
 */
export type EngineMode = 'stream' | 'synth';

export interface SearchResults {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
  isEmpty: boolean;
}
