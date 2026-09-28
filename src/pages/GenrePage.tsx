import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CollectionControls from '../components/media/CollectionControls';
import CollectionHeader from '../components/media/CollectionHeader';
import MediaCard from '../components/media/MediaCard';
import TrackList from '../components/media/TrackList';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import { useCollectionPlayback } from '../hooks/useCollectionPlayback';
import { getAlbumTracks, getGenre, getTracksByGenre, totalDuration } from '../lib/catalog';
import { albums } from '../data/mockData';
import { formatCount, formatTotalDuration, pluralize } from '../lib/format';
import type { PlaybackSource } from '../types';

export interface GenrePageProps {
  className?: string;
}

/** Browse-by-category page. Filters the catalog by a real `Track.genre`. */
export const GenrePage: React.FC<Readonly<GenrePageProps>> = ({ className = '' }) => {
  const { genreId = '' } = useParams();
  const navigate = useNavigate();
  const { play, isPlayingSource } = useCollectionPlayback();

  const genre = getGenre(genreId);

  if (!genre) {
    return (
      <EmptyState
        icon="search_off"
        title="Category not found"
        description="Try browsing the categories on the search page."
        actionLabel="Browse categories"
        onAction={() => navigate('/search')}
        className={className}
      />
    );
  }

  const tracks = getTracksByGenre(genre.name);
  const genreAlbums = albums.filter((album) => album.genre === genre.name);
  const source: PlaybackSource = {
    kind: 'genre',
    id: genre.id,
    title: genre.name,
    href: `/genre/${genre.id}`,
  };

  return (
    <div className={className}>
      <CollectionHeader
        eyebrow="Category"
        title={genre.name}
        description={`Everything in the catalog tagged ${genre.name}.`}
        artwork={genre.image}
        seed={genre.id}
        meta={
          <>
            {pluralize(tracks.length, 'track')}
            {tracks.length > 0 && ` · ${formatTotalDuration(totalDuration(tracks))}`}
          </>
        }
      >
        <CollectionControls tracks={tracks} source={source} playLabel="Play" />
      </CollectionHeader>

      <section className="mb-16">
        <SectionHeader title="Tracks" size="md" />
        <TrackList
          tracks={tracks}
          source={source}
          metaLabel="Plays"
          metaFor={(track) => formatCount(track.plays)}
          emptyIcon="music_off"
          emptyTitle={`Nothing tagged ${genre.name} yet`}
        />
      </section>

      {genreAlbums.length > 0 && (
        <section>
          <SectionHeader title="Albums" size="md" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {genreAlbums.map((album) => {
              const albumSource: PlaybackSource = {
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
                  isPlaying={isPlayingSource(albumSource)}
                  onPlay={() => play(getAlbumTracks(album.id), albumSource)}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default GenrePage;
