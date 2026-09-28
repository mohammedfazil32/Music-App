import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/libraryStore';
import { useToast } from '../../context/toastStore';
import { useUi } from '../../context/uiStore';
import { pluralize } from '../../lib/format';
import Modal from '../ui/Modal';

export interface CreatePlaylistDialogProps {
  className?: string;
}

/**
 * Create-playlist dialog. Mounted once by `Layout`; opened from the sidebar,
 * the library page, or the "Add to playlist" flow.
 */
export const CreatePlaylistDialog: React.FC<Readonly<CreatePlaylistDialogProps>> = () => {
  const { createPlaylistOpen, createPlaylistSeed, closeCreatePlaylist } = useUi();
  const { createPlaylist, updatePlaylist } = useLibrary();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const close = () => {
    setTitle('');
    setDescription('');
    closeCreatePlaylist();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = title.trim();
    if (!name) return;

    const playlist = createPlaylist(name, createPlaylistSeed);
    if (description.trim()) updatePlaylist(playlist.id, { description: description.trim() });

    notify(
      createPlaylistSeed.length > 0
        ? `Created "${playlist.title}" with ${pluralize(createPlaylistSeed.length, 'track')}`
        : `Created "${playlist.title}"`,
      { icon: 'playlist_add_check' },
    );
    close();
    navigate(`/playlist/${playlist.id}`);
  };

  return (
    <Modal
      open={createPlaylistOpen}
      onClose={close}
      title="New playlist"
      description="Give it a name now — you can add tracks from any list later."
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="playlist-title" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Name
          </label>
          <input
            id="playlist-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={60}
            placeholder="Late night drive"
            className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        <div>
          <label
            htmlFor="playlist-description"
            className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
          >
            Description <span className="font-medium normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="playlist-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            maxLength={160}
            placeholder="What is this collection for?"
            className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        {createPlaylistSeed.length > 0 && (
          <p className="text-sm text-tertiary font-semibold">
            {pluralize(createPlaylistSeed.length, 'track')} will be added straight away.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            data-modal-close
            onClick={close}
            className="px-5 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-6 py-3 rounded-full text-sm font-bold bg-primary-container text-on-primary-container hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Create playlist
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePlaylistDialog;
