import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/libraryStore';
import { usePlayer, usePlayerActions } from '../../context/playerStore';
import { useUi } from '../../context/uiStore';
import { formatTime } from '../../lib/format';
import type { PlaybackSource, Track } from '../../types';
import Artwork from '../ui/Artwork';
import Equalizer from '../ui/Equalizer';
import IconButton from '../ui/IconButton';
import Menu, { type MenuItem } from '../ui/Menu';

export interface TrackRowProps {
  track: Track;
  /** Zero-based position within `tracks`. */
  index: number;
  /** The full collection, so activating a row queues the whole thing. */
  tracks: readonly Track[];
  source: PlaybackSource;
  /** Grid template shared with the list header so columns line up. */
  gridClassName: string;
  showAlbum?: boolean;
  /** Content for the optional fourth column (date added, play count…). */
  meta?: React.ReactNode;
  /** Supplied by editable collections; adds a remove action to the menu. */
  onRemove?: () => void;
  /** Wording for that action, e.g. "Remove from Liked Songs". */
  removeLabel?: string;
  className?: string;
}

/**
 * One row in a track list.
 *
 * Reads playback state from context rather than through props so lists stay
 * cheap to render: the row knows on its own whether it is the live track.
 */
export const TrackRow: React.FC<Readonly<TrackRowProps>> = ({
  track,
  index,
  tracks,
  source,
  gridClassName,
  showAlbum = true,
  meta,
  onRemove,
  removeLabel = 'Remove from playlist',
  className = '',
}) => {
  const player = usePlayer();
  const actions = usePlayerActions();
  const { isTrackLiked, toggleTrackLike } = useLibrary();
  const { openAddToPlaylist } = useUi();
  const navigate = useNavigate();

  const isActive = player.currentTrack?.id === track.id;
  const isPlaying = isActive && player.isPlaying;
  const liked = isTrackLiked(track.id);

  const activate = () => actions.playTracks(tracks, index, source);

  const menuItems: MenuItem[] = [
    { icon: 'playlist_play', label: 'Play next', onSelect: () => actions.queueNext(track) },
    { icon: 'queue_music', label: 'Add to queue', onSelect: () => actions.queueLast(track) },
    { icon: 'playlist_add', label: 'Add to playlist', onSelect: () => openAddToPlaylist(track) },
    { icon: 'album', label: 'Go to album', onSelect: () => navigate(`/album/${track.albumId}`) },
    { icon: 'person', label: 'Go to artist', onSelect: () => navigate(`/artist/${track.artistId}`) },
    ...(onRemove ? [{ icon: 'remove_circle', label: removeLabel, onSelect: onRemove, danger: true }] : []),
  ];

  return (
    <div
      onDoubleClick={activate}
      className={`${gridClassName} gap-4 px-6 py-3 items-center transition-colors group first:rounded-t-xl last:rounded-b-xl ${
        isActive ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'
      } ${className}`}
    >
      {/* Number / play control */}
      <div className="flex items-center justify-center">
        {isPlaying ? (
          <button
            type="button"
            onClick={activate}
            aria-label={`Pause ${track.title}`}
            className="w-8 h-8 flex items-center justify-center"
          >
            <Equalizer playing className="group-hover:hidden" />
            <span
              className="material-symbols-outlined text-primary text-lg hidden group-hover:block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              pause
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={activate}
            aria-label={`Play ${track.title} by ${track.artist}`}
            className="w-8 h-8 flex items-center justify-center"
          >
            <span
              className={`text-sm font-semibold group-hover:hidden ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              {index + 1}
            </span>
            <span
              className="material-symbols-outlined text-primary text-lg hidden group-hover:block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
          </button>
        )}
      </div>

      {/* Title + artist */}
      <div className="flex items-center gap-3 min-w-0">
        <Artwork
          src={track.artwork}
          alt={`${track.album} cover`}
          seed={track.albumId}
          className="w-10 h-10 rounded-lg shrink-0"
          fallbackTextClass="text-xs"
        />
        <div className="min-w-0">
          <button
            type="button"
            onClick={activate}
            className={`block font-bold text-sm truncate text-left hover:underline ${
              isActive ? 'text-primary' : 'text-on-surface'
            }`}
          >
            {track.title}
          </button>
          <Link
            to={`/artist/${track.artistId}`}
            className="block text-xs text-on-surface-variant truncate hover:text-on-surface hover:underline"
          >
            {track.artist}
          </Link>
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        <div className="min-w-0">
          <Link
            to={`/album/${track.albumId}`}
            className="text-sm text-on-surface-variant truncate hover:text-on-surface hover:underline block"
          >
            {track.album}
          </Link>
        </div>
      )}

      {/* Optional meta column */}
      {meta !== undefined && <div className="text-sm text-on-surface-variant truncate">{meta}</div>}

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <IconButton
          icon="favorite"
          label={liked ? `Remove ${track.title} from Liked Songs` : `Add ${track.title} to Liked Songs`}
          size="xs"
          filled={liked}
          active={liked}
          activeClassName="text-tertiary"
          onClick={(event) => {
            event.stopPropagation();
            toggleTrackLike(track);
          }}
          className={liked ? '' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'}
        />
        <span className="text-sm text-on-surface-variant tabular-nums w-10 text-right">
          {formatTime(track.duration)}
        </span>
        <Menu
          items={menuItems}
          label={`More options for ${track.title}`}
          size="xs"
          className="opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        />
      </div>
    </div>
  );
};

export default TrackRow;
