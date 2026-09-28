import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import PlayerControls from '../components/player/PlayerControls';
import Seekbar from '../components/player/Seekbar';
import VolumeControl from '../components/player/VolumeControl';
import Artwork from '../components/ui/Artwork';
import EmptyState from '../components/ui/EmptyState';
import IconButton from '../components/ui/IconButton';
import { useLibrary } from '../context/libraryStore';
import { usePlayer, usePlayerActions, useProgress } from '../context/playerStore';
import { useUi } from '../context/uiStore';
import { activeLyricIndex, getLyrics } from '../lib/catalog';
import { formatCount } from '../lib/format';

export interface NowPlayingPageProps {
  className?: string;
}

/**
 * Full-screen player: artwork, transport, and time-synced lyrics.
 *
 * The lyrics pane is driven by the playback clock — the active line is derived
 * from `currentTime`, scrolls itself into view, and each line is a seek target.
 */
export const NowPlayingPage: React.FC<Readonly<NowPlayingPageProps>> = ({ className = '' }) => {
  const player = usePlayer();
  const actions = usePlayerActions();
  const { currentTime } = useProgress();
  const { isTrackLiked, toggleTrackLike } = useLibrary();
  const { toggleQueue, queueOpen, openAddToPlaylist } = useUi();

  const track = player.currentTrack;
  const lyrics = useMemo(() => getLyrics(track?.id), [track?.id]);
  const activeLine = activeLyricIndex(lyrics, currentTime);

  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (activeLine < 0) return;
    lineRefs.current[activeLine]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeLine]);

  if (!track) {
    return (
      <div className={`relative min-h-[calc(100vh-16rem)] flex items-center justify-center ${className}`}>
        <EmptyState
          icon="music_note"
          title="Nothing is playing"
          description="Choose a track, album or playlist and it will appear here with its lyrics."
          className="max-w-lg"
        />
      </div>
    );
  }

  const liked = isTrackLiked(track.id);

  return (
    <div className={`relative min-h-[calc(100vh-6rem)] -mx-10 -mt-24 ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-tertiary/10 blur-[150px] rounded-full" />
      </div>

      {/* Context header */}
      <div className="flex justify-between items-center gap-6 px-8 py-6 sticky top-0 z-40 bg-background/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-semibold min-w-0">
          <span className="material-symbols-outlined shrink-0">expand_more</span>
          {player.source?.href ? (
            <Link to={player.source.href} className="truncate hover:text-on-surface transition-colors">
              Playing from {player.source.title}
            </Link>
          ) : (
            <span className="truncate">Playing from {player.source?.title ?? 'your queue'}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {player.errored && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-tertiary mr-2">
              <span className="material-symbols-outlined text-sm">graphic_eq</span>
              Offline mix
            </span>
          )}
          <IconButton
            icon="playlist_add"
            label="Add this track to a playlist"
            size="sm"
            onClick={() => openAddToPlaylist(track)}
          />
          <IconButton
            icon="queue_music"
            label={queueOpen ? 'Hide the queue' : 'Show the queue'}
            size="sm"
            active={queueOpen}
            onClick={toggleQueue}
          />
        </div>
      </div>

      <div className="px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto items-center relative z-10">
        {/* Artwork + transport */}
        <div className="lg:col-span-6 space-y-8">
          <div className="relative group">
            <Artwork
              src={track.artwork}
              alt={`${track.album} cover`}
              seed={track.albumId}
              fallbackTextClass="text-7xl"
              className={`aspect-square w-full rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-out ${
                player.isPlaying ? 'scale-100' : 'scale-[0.97]'
              } group-hover:scale-[1.02]`}
            />
            <Link
              to={`/album/${track.albumId}`}
              className="absolute -bottom-4 -right-4 w-32 h-32 glass-player rounded-xl p-4 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform"
              title={`Go to ${track.album}`}
            >
              <span
                className="material-symbols-outlined text-primary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                album
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-center leading-tight px-1 line-clamp-2">
                {track.album}
              </span>
            </Link>
          </div>

          <div className="pt-4">
            <div className="flex justify-between items-end gap-6">
              <div className="min-w-0">
                <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tighter text-on-surface truncate">
                  {track.title}
                </h1>
                <Link
                  to={`/artist/${track.artistId}`}
                  className="text-xl font-medium text-primary mt-1 hover:underline block truncate"
                >
                  {track.artist}
                </Link>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-3">
                  {track.genre} · {track.year} · {formatCount(track.plays)} plays
                </p>
              </div>
              <IconButton
                icon="favorite"
                label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                size="md"
                filled={liked}
                active={liked}
                activeClassName="text-tertiary"
                onClick={() => toggleTrackLike(track)}
              />
            </div>
          </div>

          <Seekbar layout="stacked" className="pt-2" />

          <div className="flex items-center justify-center">
            <PlayerControls size="page" />
          </div>
        </div>

        {/* Lyrics */}
        <div className="lg:col-span-6 h-[600px] glass-player rounded-3xl p-10 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-on-surface-variant">Lyrics</h2>
            {lyrics.length > 0 && <span className="material-symbols-outlined text-tertiary text-sm">auto_awesome</span>}
          </div>

          {lyrics.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">lyrics</span>
              <p className="text-on-surface-variant font-semibold">No lyrics for this track yet</p>
              <p className="text-on-surface-variant/60 text-sm mt-2 max-w-xs">
                Time-synced lyrics are available on a selection of the catalog.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 no-scrollbar">
              {lyrics.map((line, index) => {
                const isActive = index === activeLine;
                const distance = Math.abs(index - activeLine);
                const dimming =
                  distance === 1
                    ? 'text-on-surface-variant/60'
                    : distance === 2
                      ? 'text-on-surface-variant/40'
                      : 'text-on-surface-variant/20';
                return (
                  <button
                    key={`${line.time}-${index}`}
                    ref={(element) => {
                      lineRefs.current[index] = element;
                    }}
                    type="button"
                    onClick={() => actions.seekTo(line.time)}
                    className={`block text-left w-full leading-relaxed transition-all duration-500 hover:text-on-surface ${
                      isActive
                        ? 'text-3xl font-extrabold text-on-surface text-glow'
                        : `text-2xl font-bold ${dimming}`
                    }`}
                  >
                    {line.text}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-6 flex items-center justify-between gap-6 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">
                {player.mode === 'synth' ? 'graphic_eq' : 'devices'}
              </span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest truncate">
                {player.mode === 'synth' ? 'Generative fallback' : 'This device'}
              </span>
            </div>
            <VolumeControl sliderClassName="w-28" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingPage;
