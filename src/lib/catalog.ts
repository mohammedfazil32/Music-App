import {
  albums,
  artists,
  curatedPlaylists,
  genres,
  lyricsByTrackId,
  tracks,
} from '../data/mockData';
import type { Album, Artist, Genre, LyricLine, Playlist, SearchResults, Track } from '../types';

/**
 * Read-only selectors over the catalog in `src/data/mockData.ts`.
 *
 * Components never index the raw arrays — they ask for what they need here, so
 * lookups stay O(1) and the relational shape (track -> album -> artist) is
 * resolved in exactly one place.
 */

const trackMap = new Map(tracks.map((track) => [track.id, track]));
const albumMap = new Map(albums.map((album) => [album.id, album]));
const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
const curatedMap = new Map(curatedPlaylists.map((playlist) => [playlist.id, playlist]));
const genreMap = new Map(genres.map((genre) => [genre.id, genre]));

export function getTrack(id: string | undefined): Track | undefined {
  return id ? trackMap.get(id) : undefined;
}

/** Resolves ids to tracks, dropping any that no longer exist in the catalog. */
export function getTracks(ids: readonly string[]): Track[] {
  return ids.map((id) => trackMap.get(id)).filter((track): track is Track => Boolean(track));
}

export function getAlbum(id: string | undefined): Album | undefined {
  return id ? albumMap.get(id) : undefined;
}

export function getArtist(id: string | undefined): Artist | undefined {
  return id ? artistMap.get(id) : undefined;
}

export function getCuratedPlaylist(id: string | undefined): Playlist | undefined {
  return id ? curatedMap.get(id) : undefined;
}

export function getGenre(id: string | undefined): Genre | undefined {
  return id ? genreMap.get(id) : undefined;
}

/** Album tracks in running order. */
export function getAlbumTracks(albumId: string): Track[] {
  return tracks.filter((track) => track.albumId === albumId);
}

/** An artist's catalogue, most played first. */
export function getArtistTracks(artistId: string): Track[] {
  return tracks.filter((track) => track.artistId === artistId).sort((a, b) => b.plays - a.plays);
}

export function getArtistAlbums(artistId: string): Album[] {
  return albums.filter((album) => album.artistId === artistId).sort((a, b) => b.year - a.year);
}

export function getTracksByGenre(genreName: string): Track[] {
  const needle = genreName.toLowerCase();
  return tracks.filter((track) => track.genre.toLowerCase() === needle);
}

export function getLyrics(trackId: string | undefined): LyricLine[] {
  return trackId ? (lyricsByTrackId[trackId] ?? []) : [];
}

/** Which lyric line is active at `time`; -1 before the first line. */
export function activeLyricIndex(lines: readonly LyricLine[], time: number): number {
  let index = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].time <= time) index = i;
    else break;
  }
  return index;
}

/**
 * Cover art for a playlist. User-created playlists have no artwork of their
 * own, so they inherit the first track's — and fall back to a tonal gradient
 * (handled by `<Artwork>`) while they are still empty.
 */
export function playlistCover(playlist: Playlist): string {
  if (playlist.artwork) return playlist.artwork;
  const first = getTracks(playlist.trackIds)[0];
  return first?.artwork ?? '';
}

export function totalDuration(list: readonly Track[]): number {
  return list.reduce((sum, track) => sum + track.duration, 0);
}

/** Most played tracks across the catalog. */
export function getTrendingTracks(limit = 8): Track[] {
  return [...tracks].sort((a, b) => b.plays - a.plays).slice(0, limit);
}

export function getNewReleases(limit = 6): Album[] {
  return [...albums].sort((a, b) => b.year - a.year).slice(0, limit);
}

/** Fisher-Yates. Returns a new array; never mutates the input. */
export function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Prefix matches rank above substring matches, so typing feels responsive. */
function score(haystack: string, needle: string): number {
  const value = haystack.toLowerCase();
  const at = value.indexOf(needle);
  if (at === -1) return -1;
  return at === 0 ? 0 : 1 + at;
}

function bestScore(fields: readonly string[], needle: string): number {
  let best = -1;
  for (const field of fields) {
    const result = score(field, needle);
    if (result !== -1 && (best === -1 || result < best)) best = result;
  }
  return best;
}

/** Free-text search across every entity type. */
export function searchCatalog(query: string, userPlaylists: readonly Playlist[] = []): SearchResults {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return { tracks: [], artists: [], albums: [], playlists: [], isEmpty: true };
  }

  const rank = <T>(items: readonly T[], fields: (item: T) => string[]): T[] =>
    items
      .map((item) => ({ item, rank: bestScore(fields(item), needle) }))
      .filter((entry) => entry.rank !== -1)
      .sort((a, b) => a.rank - b.rank)
      .map((entry) => entry.item);

  const matchedTracks = rank(tracks, (t) => [t.title, t.artist, t.album, t.genre]);
  const matchedArtists = rank(artists, (a) => [a.name, ...a.genres]);
  const matchedAlbums = rank(albums, (a) => [a.title, a.artist, a.genre]);
  const matchedPlaylists = rank([...curatedPlaylists, ...userPlaylists], (p) => [p.title, p.description]);

  return {
    tracks: matchedTracks,
    artists: matchedArtists,
    albums: matchedAlbums,
    playlists: matchedPlaylists,
    isEmpty:
      matchedTracks.length === 0 &&
      matchedArtists.length === 0 &&
      matchedAlbums.length === 0 &&
      matchedPlaylists.length === 0,
  };
}
