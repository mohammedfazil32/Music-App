import React from 'react';
import { useNavigate } from 'react-router-dom';
import CollectionControls from '../components/media/CollectionControls';
import CollectionHeader from '../components/media/CollectionHeader';
import TrackList from '../components/media/TrackList';
import { useLibrary } from '../context/libraryStore';
import { usePlayerActions } from '../context/playerStore';
import { useToast } from '../context/toastStore';
import { useUi } from '../context/uiStore';
import { currentUser } from '../data/mockData';
import { getTracks, totalDuration } from '../lib/catalog';
import { formatRelativeDate, formatTotalDuration, pluralize } from '../lib/format';
import type { PlaybackSource } from '../types';

export interface LikedSongsPageProps {
  className?: string;
}

const SOURCE: PlaybackSource = { kind: 'liked', id: 'liked', title: 'Liked Songs', href: '/liked' };

/** Every track the listener has hearted, newest first. */
export const LikedSongsPage: React.FC<Readonly<LikedSongsPageProps>> = ({ className = '' }) => {
  const { likedTrackIds, likedAt, toggleTrackLike } = useLibrary();
  const { queueLast } = usePlayerActions();
  const { openCreatePlaylist } = useUi();
  const { notify } = useToast();
  const navigate = useNavigate();

  const tracks = getTracks(likedTrackIds);

  return (
    <div className={className}>
      <CollectionHeader
        eyebrow="Playlist"
        title="Liked Songs"
        description="Everything you have hearted, in the order you found it."
        artwork={tracks[0]?.artwork}
        seed="liked-songs"
        icon="favorite"
        meta={
          <>
            {currentUser.name} · {pluralize(tracks.length, 'track')}
            {tracks.length > 0 && ` · ${formatTotalDuration(totalDuration(tracks))}`}
          </>
        }
      >
        <CollectionControls
          tracks={tracks}
          source={SOURCE}
          playLabel="Play"
          menuItems={[
            {
              icon: 'queue_music',
              label: 'Add all to queue',
              disabled: tracks.length === 0,
              onSelect: () => {
                tracks.forEach((track) => queueLast(track));
                notify(`Added ${pluralize(tracks.length, 'track')} to the queue`, { icon: 'queue_music' });
              },
            },
            {
              icon: 'playlist_add',
              label: 'Save as a playlist',
              disabled: tracks.length === 0,
              onSelect: () => openCreatePlaylist(tracks.map((track) => track.id)),
            },
          ]}
        />
      </CollectionHeader>

      <TrackList
        tracks={tracks}
        source={SOURCE}
        metaLabel="Date added"
        metaFor={(track) => (likedAt[track.id] ? formatRelativeDate(likedAt[track.id]) : '—')}
        onRemove={(index) => toggleTrackLike(tracks[index])}
        removeLabel="Remove from Liked Songs"
        emptyIcon="favorite"
        emptyTitle="No liked songs yet"
        emptyDescription="Tap the heart on any track and it will collect here."
      />

      {tracks.length === 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Find something to listen to
          </button>
        </div>
      )}
    </div>
  );
};

export default LikedSongsPage;
