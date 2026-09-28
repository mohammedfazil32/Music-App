import React from 'react';
import { useLibrary } from '../../context/libraryStore';
import { useToast } from '../../context/toastStore';
import { useUi } from '../../context/uiStore';
import { playlistCover } from '../../lib/catalog';
import { pluralize } from '../../lib/format';
import Artwork from '../ui/Artwork';
import Modal from '../ui/Modal';

export interface AddToPlaylistDialogProps {
  className?: string;
}

/**
 * "Add to playlist" picker for a single track. Mounted once by `Layout` and
 * driven by `UiContext`, so any track row can open it without prop drilling.
 */
export const AddToPlaylistDialog: React.FC<Readonly<AddToPlaylistDialogProps>> = () => {
  const { addToPlaylistTarget, closeAddToPlaylist, openCreatePlaylist } = useUi();
  const { playlists, addTracksToPlaylist } = useLibrary();
  const { notify } = useToast();

  const track = addToPlaylistTarget;

  const add = (playlistId: string, playlistTitle: string) => {
    if (!track) return;
    const added = addTracksToPlaylist(playlistId, [track.id]);
    notify(
      added > 0 ? `Added "${track.title}" to ${playlistTitle}` : `"${track.title}" is already in ${playlistTitle}`,
      { icon: added > 0 ? 'playlist_add_check' : 'info' },
    );
    closeAddToPlaylist();
  };

  return (
    <Modal
      open={track !== null}
      onClose={closeAddToPlaylist}
      title="Add to playlist"
      description={track ? `${track.title} — ${track.artist}` : undefined}
    >
      <div className="space-y-2 max-h-80 overflow-y-auto -mx-2 px-2">
        {playlists.map((playlist) => {
          const alreadyIn = track ? playlist.trackIds.includes(track.id) : false;
          return (
            <button
              key={playlist.id}
              type="button"
              onClick={() => add(playlist.id, playlist.title)}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-bright transition-colors text-left"
            >
              <Artwork
                src={playlistCover(playlist)}
                alt={playlist.title}
                seed={playlist.id}
                icon="queue_music"
                fallbackTextClass="text-lg"
                className="w-12 h-12 rounded-xl shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-on-surface truncate">{playlist.title}</span>
                <span className="block text-xs text-on-surface-variant">
                  {pluralize(playlist.trackIds.length, 'track')}
                </span>
              </span>
              {alreadyIn && (
                <span className="material-symbols-outlined text-tertiary text-lg" aria-label="Already added">
                  check_circle
                </span>
              )}
            </button>
          );
        })}

        {playlists.length === 0 && (
          <p className="text-sm text-on-surface-variant px-3 py-6 text-center">
            You do not have any playlists yet.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => openCreatePlaylist(track ? [track.id] : [])}
        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-full bg-surface-container-highest hover:bg-surface-bright text-on-surface font-bold text-sm transition-colors"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        New playlist with this track
      </button>
    </Modal>
  );
};

export default AddToPlaylistDialog;
