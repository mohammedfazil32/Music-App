import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CollectionControls from '../components/media/CollectionControls';
import CollectionHeader from '../components/media/CollectionHeader';
import MediaCard from '../components/media/MediaCard';
import TrackList from '../components/media/TrackList';
import EmptyState from '../components/ui/EmptyState';
import IconButton from '../components/ui/IconButton';
import SectionHeader from '../components/ui/SectionHeader';
import { useLibrary } from '../context/libraryStore';
import { usePlayerActions } from '../context/playerStore';
import { useToast } from '../context/toastStore';
import { useCollectionPlayback } from '../hooks/useCollectionPlayback';
import { getAlbum, getAlbumTracks, getArtist, getArtistAlbums, totalDuration } from '../lib/catalog';
import { formatCount, formatTotalDuration, pluralize } from '../lib/format';
import type { PlaybackSource } from '../types';

export interface AlbumPageProps {
  className?: string;
}

/** Album detail with its running order and the rest of the artist's catalogue. */
export const AlbumPage: React.FC<Readonly<AlbumPageProps>> = ({ className = '' }) => {
  const { albumId = '' } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { isAlbumLiked, toggleAlbumLike } = useLibrary();
  const { queueLast } = usePlayerActions();
  const { play, isPlayingSource } = useCollectionPlayback();

  const album = getAlbum(albumId);

  if (!album) {
    return (
      <EmptyState
        icon="search_off"
        title="Album not found"
        description="That album is not in the catalog."
        actionLabel="Back home"
        onAction={() => navigate('/')}
        className={className}
      />
    );
  }

  const tracks = getAlbumTracks(album.id);
  const artist = getArtist(album.artistId);
  const otherAlbums = getArtistAlbums(album.artistId).filter((item) => item.id !== album.id);
  const saved = isAlbumLiked(album.id);
  const source: PlaybackSource = {
    kind: 'album',
    id: album.id,
    title: album.title,
    href: `/album/${album.id}`,
  };

  return (
    <div className={className}>
      <CollectionHeader
        eyebrow="Album"
        title={album.title}
        description={album.description}
        artwork={album.artwork}
        seed={album.id}
        meta={
          <>
            <Link to={`/artist/${album.artistId}`} className="hover:text-on-surface hover:underline">
              {album.artist}
            </Link>
            {` · ${album.year} · ${album.genre} · ${pluralize(tracks.length, 'track')} · ${formatTotalDuration(
              totalDuration(tracks),
            )}`}
          </>
        }
      >
        <CollectionControls
          tracks={tracks}
          source={source}
          playLabel="Play"
          menuItems={[
            {
              icon: 'queue_music',
              label: 'Add all to queue',
              onSelect: () => {
                tracks.forEach((track) => queueLast(track));
                notify(`Added ${pluralize(tracks.length, 'track')} to the queue`, { icon: 'queue_music' });
              },
            },
            {
              icon: 'person',
              label: `Go to ${album.artist}`,
              onSelect: () => navigate(`/artist/${album.artistId}`),
            },
          ]}
        >
          <IconButton
            icon={saved ? 'library_add_check' : 'library_add'}
            label={saved ? 'Remove this album from your library' : 'Save this album to your library'}
            size="md"
            variant="tonal"
            active={saved}
            activeClassName="text-tertiary"
            filled={saved}
            onClick={() => toggleAlbumLike(album)}
          />
        </CollectionControls>
      </CollectionHeader>

      <TrackList
        tracks={tracks}
        source={source}
        showAlbum={false}
        metaLabel="Plays"
        metaFor={(track) => formatCount(track.plays)}
      />

      {artist && (
        <section className="mt-16">
          <SectionHeader
            title={`More by ${artist.name}`}
            subtitle={artist.bio}
            size="md"
            actionLabel="Artist page"
            actionTo={`/artist/${artist.id}`}
          />
          {otherAlbums.length === 0 ? (
            <p className="text-on-surface-variant">This is the only album by {artist.name} in the catalog.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
              {otherAlbums.map((other) => {
                const otherSource: PlaybackSource = {
                  kind: 'album',
                  id: other.id,
                  title: other.title,
                  href: `/album/${other.id}`,
                };
                return (
                  <MediaCard
                    key={other.id}
                    to={`/album/${other.id}`}
                    title={other.title}
                    subtitle={`${other.year} · ${other.genre}`}
                    artwork={other.artwork}
                    seed={other.id}
                    isPlaying={isPlayingSource(otherSource)}
                    onPlay={() => play(getAlbumTracks(other.id), otherSource)}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AlbumPage;
