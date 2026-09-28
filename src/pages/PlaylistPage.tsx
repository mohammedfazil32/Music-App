import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CollectionControls from '../components/media/CollectionControls';
import CollectionHeader from '../components/media/CollectionHeader';
import TrackList from '../components/media/TrackList';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { useLibrary } from '../context/libraryStore';
import { usePlayerActions } from '../context/playerStore';
import { useToast } from '../context/toastStore';
import { getCuratedPlaylist, getTracks, playlistCover, totalDuration } from '../lib/catalog';
import { formatCount, formatRelativeDate, formatTotalDuration, pluralize } from '../lib/format';
import type { PlaybackSource } from '../types';

export interface PlaylistPageProps {
  className?: string;
}

/**
 * Playlist detail for both curated and user playlists.
 *
 * User-owned playlists additionally get rename, delete and per-track removal;
 * curated ones are read-only.
 */
export const PlaylistPage: React.FC<Readonly<PlaylistPageProps>> = ({ className = '' }) => {
  const { playlistId = '' } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { getUserPlaylist, updatePlaylist, deletePlaylist, removeTrackFromPlaylist } = useLibrary();
  const { queueLast } = usePlayerActions();

  const playlist = getCuratedPlaylist(playlistId) ?? getUserPlaylist(playlistId);

  const [renameOpen, setRenameOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!playlist) {
    return (
      <EmptyState
        icon="search_off"
        title="Playlist not found"
        description="It may have been deleted, or the link is out of date."
        actionLabel="Back to your library"
        onAction={() => navigate('/library')}
        className={className}
      />
    );
  }

  const tracks = getTracks(playlist.trackIds);
  const source: PlaybackSource = {
    kind: 'playlist',
    id: playlist.id,
    title: playlist.title,
    href: `/playlist/${playlist.id}`,
  };

  const openRename = () => {
    setDraftTitle(playlist.title);
    setDraftDescription(playlist.description);
    setRenameOpen(true);
  };

  const saveRename = (event: React.FormEvent) => {
    event.preventDefault();
    updatePlaylist(playlist.id, { title: draftTitle, description: draftDescription });
    setRenameOpen(false);
    notify('Playlist updated', { icon: 'edit' });
  };

  const remove = () => {
    deletePlaylist(playlist.id);
    setConfirmDelete(false);
    notify(`Deleted "${playlist.title}"`, { icon: 'delete' });
    navigate('/library?tab=Playlists');
  };

  const menuItems = [
    {
      icon: 'queue_music',
      label: 'Add all to queue',
      disabled: tracks.length === 0,
      onSelect: () => {
        tracks.forEach((track) => queueLast(track));
        notify(`Added ${pluralize(tracks.length, 'track')} to the queue`, { icon: 'queue_music' });
      },
    },
    ...(playlist.editable
      ? [
          { icon: 'edit', label: 'Rename playlist', onSelect: openRename },
          { icon: 'delete', label: 'Delete playlist', onSelect: () => setConfirmDelete(true), danger: true },
        ]
      : []),
  ];

  return (
    <div className={className}>
      <CollectionHeader
        eyebrow={playlist.editable ? 'Your playlist' : 'Curated playlist'}
        title={playlist.title}
        description={playlist.description}
        artwork={playlistCover(playlist)}
        seed={playlist.id}
        icon="queue_music"
        meta={
          <>
            {playlist.owner} · {pluralize(tracks.length, 'track')}
            {tracks.length > 0 && ` · ${formatTotalDuration(totalDuration(tracks))}`}
            {` · created ${formatRelativeDate(playlist.createdAt)}`}
          </>
        }
      >
        <CollectionControls tracks={tracks} source={source} playLabel="Play" menuItems={menuItems} />
      </CollectionHeader>

      <TrackList
        tracks={tracks}
        source={source}
        metaLabel="Plays"
        metaFor={(track) => formatCount(track.plays)}
        onRemove={
          playlist.editable
            ? (index) => {
                const removed = tracks[index];
                removeTrackFromPlaylist(playlist.id, index);
                notify(`Removed "${removed.title}" from ${playlist.title}`, { icon: 'remove_circle' });
              }
            : undefined
        }
        emptyIcon="playlist_add"
        emptyTitle="This playlist is empty"
        emptyDescription='Find something you like and choose "Add to playlist" from its menu.'
      />

      {/* Rename */}
      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="Edit playlist">
        <form onSubmit={saveRename} className="space-y-5">
          <div>
            <label
              htmlFor="rename-title"
              className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
            >
              Name
            </label>
            <input
              id="rename-title"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              maxLength={60}
              className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div>
            <label
              htmlFor="rename-description"
              className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
            >
              Description
            </label>
            <textarea
              id="rename-description"
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              rows={2}
              maxLength={160}
              className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              data-modal-close
              onClick={() => setRenameOpen(false)}
              className="px-5 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!draftTitle.trim()}
              className="px-6 py-3 rounded-full text-sm font-bold bg-primary-container text-on-primary-container hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Save changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this playlist?"
        description={`"${playlist.title}" will be removed from your library. This cannot be undone.`}
        footer={
          <>
            <button
              type="button"
              data-modal-close
              onClick={() => setConfirmDelete(false)}
              className="px-5 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={remove}
              className="px-6 py-3 rounded-full text-sm font-bold bg-error-container text-on-error-container hover:opacity-90 active:scale-95 transition-all"
            >
              Delete playlist
            </button>
          </>
        }
      />
    </div>
  );
};

export default PlaylistPage;
