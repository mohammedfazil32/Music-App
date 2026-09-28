import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CollectionControls from '../components/media/CollectionControls';
import CollectionHeader from '../components/media/CollectionHeader';
import MediaCard from '../components/media/MediaCard';
import TrackList from '../components/media/TrackList';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import { useLibrary } from '../context/libraryStore';
import { useCollectionPlayback } from '../hooks/useCollectionPlayback';
import { getAlbumTracks, getArtist, getArtistAlbums, getArtistTracks } from '../lib/catalog';
import { formatCount, pluralize } from '../lib/format';
import type { PlaybackSource } from '../types';

export interface ArtistPageProps {
  className?: string;
}

/** Artist detail: follow, popular tracks, and full discography. */
export const ArtistPage: React.FC<Readonly<ArtistPageProps>> = ({ className = '' }) => {
  const { artistId = '' } = useParams();
  const navigate = useNavigate();
  const { isFollowingArtist, toggleFollowArtist } = useLibrary();
  const { play, isPlayingSource } = useCollectionPlayback();

  const artist = getArtist(artistId);

  if (!artist) {
    return (
      <EmptyState
        icon="search_off"
        title="Artist not found"
        description="That artist is not in the catalog."
        actionLabel="Back home"
        onAction={() => navigate('/')}
        className={className}
      />
    );
  }

  const tracks = getArtistTracks(artist.id);
  const albums = getArtistAlbums(artist.id);
  const following = isFollowingArtist(artist.id);
  const source: PlaybackSource = {
    kind: 'artist',
    id: artist.id,
    title: artist.name,
    href: `/artist/${artist.id}`,
  };

  return (
    <div className={className}>
      <CollectionHeader
        eyebrow="Artist"
        title={artist.name}
        description={artist.bio}
        artwork={artist.image}
        seed={artist.id}
        round
        meta={
          <>
            {formatCount(artist.monthlyListeners)} monthly listeners · {pluralize(tracks.length, 'track')} ·{' '}
            {pluralize(albums.length, 'album')}
          </>
        }
      >
        <CollectionControls tracks={tracks} source={source} playLabel="Play">
          <button
            type="button"
            onClick={() => toggleFollowArtist(artist)}
            aria-pressed={following}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all active:scale-95 ${
              following
                ? 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
                : 'bg-tertiary-container text-on-tertiary-container hover:opacity-90'
            }`}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </CollectionControls>
      </CollectionHeader>

      <div className="flex flex-wrap gap-2 mb-12">
        {artist.genres.map((genre) => (
          <Link
            key={genre}
            to={`/search?q=${encodeURIComponent(genre)}`}
            className="px-4 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {genre}
          </Link>
        ))}
      </div>

      <section className="mb-16">
        <SectionHeader title="Popular" subtitle="Most played tracks by this artist" size="md" />
        <TrackList
          tracks={tracks.slice(0, 5)}
          source={source}
          metaLabel="Plays"
          metaFor={(track) => formatCount(track.plays)}
        />
      </section>

      <section>
        <SectionHeader title="Discography" size="md" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {albums.map((album) => {
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
                subtitle={`${album.year} · ${album.genre}`}
                artwork={album.artwork}
                seed={album.id}
                isPlaying={isPlayingSource(albumSource)}
                onPlay={() => play(getAlbumTracks(album.id), albumSource)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ArtistPage;
