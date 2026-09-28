import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/libraryStore';
import { usePlayer } from '../../context/playerStore';
import { useUi } from '../../context/uiStore';
import Artwork from '../ui/Artwork';
import IconButton from '../ui/IconButton';
import PlayerControls from './PlayerControls';
import Seekbar from './Seekbar';
import VolumeControl from './VolumeControl';

export interface NowPlayingBarProps {
  className?: string;
}

/**
 * The persistent floating transport.
 *
 * Always mounted (so playback survives navigation) and shows a quiet idle state
 * before anything has been queued.
 */
export const NowPlayingBar: React.FC<Readonly<NowPlayingBarProps>> = ({ className = '' }) => {
  const player = usePlayer();
  const { isTrackLiked, toggleTrackLike } = useLibrary();
  const { queueOpen, toggleQueue } = useUi();
  const navigate = useNavigate();

  const track = player.currentTrack;
  const liked = track ? isTrackLiked(track.id) : false;

  return (
    <footer
      className={`fixed bottom-6 left-[18rem] right-6 rounded-2xl h-20 glass-player flex items-center justify-between gap-6 px-6 z-50 shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${className}`}
    >
      {/* Track info */}
      <div className="flex items-center gap-4 w-1/3 min-w-0">
        {track ? (
          <>
            <button
              type="button"
              onClick={() => navigate('/player')}
              aria-label="Open the Now Playing view"
              className="w-12 h-12 shrink-0 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
            >
              <Artwork
                src={track.artwork}
                alt={`${track.album} cover`}
                seed={track.albumId}
                className="w-12 h-12"
                fallbackTextClass="text-sm"
              />
            </button>
            <div className="min-w-0">
              <Link
                to="/player"
                className="block text-sm font-bold text-on-surface leading-tight truncate hover:underline"
              >
                {track.title}
              </Link>
              <Link
                to={`/artist/${track.artistId}`}
                className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-widest truncate hover:text-on-surface"
              >
                {track.artist}
              </Link>
            </div>
            <IconButton
              icon="favorite"
              label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
              size="xs"
              filled={liked}
              active={liked}
              activeClassName="text-tertiary"
              onClick={() => toggleTrackLike(track)}
            />
          </>
        ) : (
          <>
            <div className="w-12 h-12 shrink-0 rounded-lg bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">music_note</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface leading-tight">Nothing playing</p>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest truncate">
                Pick a track to begin
              </p>
            </div>
          </>
        )}
      </div>

      {/* Transport */}
      <div className="flex flex-col items-center justify-center w-1/3 gap-1">
        <PlayerControls size="bar" />
        <Seekbar className="w-full" />
      </div>

      {/* Output controls */}
      <div className="flex items-center justify-end gap-3 w-1/3">
        {player.errored && (
          <span
            className="hidden xl:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-tertiary"
            title="The stream could not be reached, so the generative fallback voice is playing instead."
          >
            <span className="material-symbols-outlined text-sm">graphic_eq</span>
            Offline mix
          </span>
        )}
        <IconButton
          icon="queue_music"
          label={queueOpen ? 'Hide the queue' : 'Show the queue'}
          size="sm"
          active={queueOpen}
          onClick={toggleQueue}
        />
        <IconButton
          icon="open_in_full"
          label="Open the Now Playing view"
          size="sm"
          onClick={() => navigate('/player')}
        />
        <VolumeControl />
      </div>
    </footer>
  );
};

export default NowPlayingBar;
