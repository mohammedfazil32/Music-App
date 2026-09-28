import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MediaCard from '../components/media/MediaCard';
import TrackList from '../components/media/TrackList';
import Artwork from '../components/ui/Artwork';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import { useLibrary } from '../context/libraryStore';
import { genres, searchSuggestions } from '../data/mockData';
import { useCollectionPlayback } from '../hooks/useCollectionPlayback';
import { getAlbumTracks, getArtistTracks, getTracks, playlistCover, searchCatalog } from '../lib/catalog';
import { formatCount, pluralize } from '../lib/format';
import type { PlaybackSource } from '../types';

export interface SearchPageProps {
  className?: string;
}

const FILTERS = ['All', 'Tracks', 'Artists', 'Albums', 'Playlists'] as const;
type Filter = (typeof FILTERS)[number];

/**
 * Search and browse.
 *
 * The query lives in the URL (`?q=`) so results are shareable and survive a
 * reload; the header field is the only input, this page renders the results.
 */
export const SearchPage: React.FC<Readonly<SearchPageProps>> = ({ className = '' }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { playlists, searchHistory, removeSearchTerm, clearSearchHistory } = useLibrary();
  const { play, isPlayingSource } = useCollectionPlayback();
  const [filter, setFilter] = useState<Filter>('All');

  const results = useMemo(() => searchCatalog(query, playlists), [query, playlists]);

  // --- browse mode -------------------------------------------------------
  if (!query.trim()) {
    return (
      <div className={className}>
        {searchHistory.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Recent searches</h2>
              <button type="button" onClick={clearSearchHistory} className="text-xs font-bold text-primary hover:underline">
                Clear history
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {searchHistory.map((term) => (
                <span
                  key={term}
                  className="flex items-center bg-surface-container-low hover:bg-surface-container-high pl-4 pr-2 py-2 rounded-full transition-all group"
                >
                  <Link to={`/search?q=${encodeURIComponent(term)}`} className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 text-primary">history</span>
                    <span className="text-sm font-medium">{term}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeSearchTerm(term)}
                    aria-label={`Remove "${term}" from recent searches`}
                    className="ml-3 w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">Try searching for</h2>
          <div className="flex flex-wrap gap-3">
            {searchSuggestions.map((suggestion) => (
              <Link
                key={suggestion}
                to={`/search?q=${encodeURIComponent(suggestion)}`}
                className="bg-surface-container-low hover:bg-surface-container-high px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold tracking-tight mb-8">Browse all categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                to={`/genre/${genre.id}`}
                className="relative h-48 rounded-xl overflow-hidden group bg-surface-container-low"
              >
                <Artwork
                  src={genre.image}
                  alt={genre.name}
                  seed={genre.id}
                  className="absolute inset-0 w-full h-full"
                  imageClassName="group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} to-transparent`} />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-on-surface drop-shadow-lg">{genre.name}</h3>
                </div>
                <span className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span
                    className="material-symbols-outlined text-primary text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_circle
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // --- results mode ------------------------------------------------------
  if (results.isEmpty) {
    return (
      <div className={className}>
        <EmptyState
          icon="search_off"
          title={`No results for "${query}"`}
          description="Check the spelling, or try a broader term like an artist name or a genre."
        />
      </div>
    );
  }

  const showTracks = filter === 'All' || filter === 'Tracks';
  const showArtists = filter === 'All' || filter === 'Artists';
  const showAlbums = filter === 'All' || filter === 'Albums';
  const showPlaylists = filter === 'All' || filter === 'Playlists';
  const searchSource: PlaybackSource = { kind: 'search', id: query, title: `Results for "${query}"` };

  return (
    <div className={className}>
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
          Results for <span className="text-primary">{query}</span>
        </h1>
        <p className="text-on-surface-variant">
          {pluralize(results.tracks.length, 'track')} · {pluralize(results.artists.length, 'artist')} ·{' '}
          {pluralize(results.albums.length, 'album')} · {pluralize(results.playlists.length, 'playlist')}
        </p>
      </div>

      <div className="flex gap-3 mb-10 flex-wrap">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            aria-pressed={filter === option}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              filter === option
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showTracks && results.tracks.length > 0 && (
        <section className="mb-16">
          <SectionHeader title="Tracks" size="md" />
          <TrackList
            tracks={filter === 'All' ? results.tracks.slice(0, 6) : results.tracks}
            source={searchSource}
            metaLabel="Plays"
            metaFor={(track) => formatCount(track.plays)}
          />
        </section>
      )}

      {showArtists && results.artists.length > 0 && (
        <section className="mb-16">
          <SectionHeader title="Artists" size="md" />
          <div className="flex gap-10 flex-wrap">
            {results.artists.map((artist) => {
              const source: PlaybackSource = {
                kind: 'artist',
                id: artist.id,
                title: artist.name,
                href: `/artist/${artist.id}`,
              };
              return (
                <div key={artist.id} className="w-36">
                  <MediaCard
                    to={`/artist/${artist.id}`}
                    title={artist.name}
                    subtitle={artist.genres[0]}
                    artwork={artist.image}
                    seed={artist.id}
                    round
                    isPlaying={isPlayingSource(source)}
                    onPlay={() => play(getArtistTracks(artist.id), source)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {showAlbums && results.albums.length > 0 && (
        <section className="mb-16">
          <SectionHeader title="Albums" size="md" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {results.albums.map((album) => {
              const source: PlaybackSource = {
                kind: 'album',
                id: album.id,
                title: album.title,
                href: `/album/${album.id}`,
              };
              return (
                <MediaCard
                  key={album.id}
                  to={`/album/${album.id}`}
                  title={album.title}
                  subtitle={`${album.artist} · ${album.year}`}
                  artwork={album.artwork}
                  seed={album.id}
                  isPlaying={isPlayingSource(source)}
                  onPlay={() => play(getAlbumTracks(album.id), source)}
                />
              );
            })}
          </div>
        </section>
      )}

      {showPlaylists && results.playlists.length > 0 && (
        <section>
          <SectionHeader title="Playlists" size="md" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {results.playlists.map((playlist) => {
              const source: PlaybackSource = {
                kind: 'playlist',
                id: playlist.id,
                title: playlist.title,
                href: `/playlist/${playlist.id}`,
              };
              return (
                <MediaCard
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  title={playlist.title}
                  subtitle={playlist.description || pluralize(playlist.trackIds.length, 'track')}
                  artwork={playlistCover(playlist)}
                  seed={playlist.id}
                  icon="queue_music"
                  isPlaying={isPlayingSource(source)}
                  onPlay={() => play(getTracks(playlist.trackIds), source)}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;
