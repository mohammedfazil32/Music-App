import React from 'react';
import { Link } from 'react-router-dom';
import { usePlayer, usePlayerActions } from '../../context/playerStore';
import { useUi } from '../../context/uiStore';
import { formatTime, formatTotalDuration, pluralize } from '../../lib/format';
import Artwork from '../ui/Artwork';
import Equalizer from '../ui/Equalizer';
import IconButton from '../ui/IconButton';

export interface QueuePanelProps {
  className?: string;
}

/**
 * Slide-over queue.
 *
 * Reordering uses explicit move-up/move-down buttons rather than drag and drop:
 * it is keyboard-operable, screen-reader friendly, and reliable on touch. Every
 * row is addressed by its queue `key`, so duplicated tracks behave correctly.
 */
export const QueuePanel: React.FC<Readonly<QueuePanelProps>> = ({ className = '' }) => {
  const player = usePlayer();
  const actions = usePlayerActions();
  const { queueOpen, setQueueOpen } = useUi();

  const upNextDuration = player.upNext.reduce((sum, entry) => sum + entry.track.duration, 0);

  return (
    <aside
      aria-label="Play queue"
      aria-hidden={!queueOpen}
      className={`fixed right-6 top-24 bottom-32 w-[22rem] z-[60] glass-player rounded-3xl flex flex-col shadow-[0_30px_70px_rgba(0,0,0,0.6)] transition-all duration-300 ${
        queueOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
      } ${className}`}
    >
      <header className="flex items-start justify-between gap-3 p-6 pb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight text-on-surface">Queue</h2>
          {player.source && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant truncate mt-1">
              From {player.source.title}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            icon="playlist_remove"
            label="Clear the queue"
            size="sm"
            disabled={player.upNext.length === 0}
            onClick={actions.clearQueue}
          />
          <IconButton icon="close" label="Close queue" size="sm" onClick={() => setQueueOpen(false)} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
        {/* Now playing */}
        {player.currentTrack && (
          <section>
            <h3 className="px-2 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">Now playing</h3>
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-surface-container-highest/60">
              <Artwork
                src={player.currentTrack.artwork}
                alt={`${player.currentTrack.album} cover`}
                seed={player.currentTrack.albumId}
                className="w-11 h-11 rounded-lg shrink-0"
                fallbackTextClass="text-xs"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-primary truncate">{player.currentTrack.title}</p>
                <Link
                  to={`/artist/${player.currentTrack.artistId}`}
                  className="text-xs text-on-surface-variant truncate hover:underline block"
                >
                  {player.currentTrack.artist}
                </Link>
              </div>
              <Equalizer playing={player.isPlaying} className="mr-2" />
            </div>
          </section>
        )}

        {/* Up next */}
        <section>
          <div className="flex items-baseline justify-between px-2 mb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Up next</h3>
            {player.upNext.length > 0 && (
              <span className="text-[10px] font-bold text-on-surface-variant/70">
                {pluralize(player.upNext.length, 'track')} · {formatTotalDuration(upNextDuration)}
              </span>
            )}
          </div>

          {player.upNext.length === 0 ? (
            <p className="px-2 text-sm text-on-surface-variant/70">
              {player.hasQueue
                ? 'Nothing queued. Use "Add to queue" on any track.'
                : 'The queue is empty — play something to get started.'}
            </p>
          ) : (
            <ul className="space-y-1">
              {player.upNext.map((entry, offset) => {
                const queueIndex = player.index + 1 + offset;
                return (
                  <li key={entry.key} className="group flex items-center gap-3 p-2 rounded-2xl hover:bg-surface-bright/60 transition-colors">
                    <button
                      type="button"
                      onClick={() => actions.playAt(queueIndex)}
                      aria-label={`Play ${entry.track.title}`}
                      className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden"
                    >
                      <Artwork
                        src={entry.track.artwork}
                        alt={`${entry.track.album} cover`}
                        seed={entry.track.albumId}
                        className="w-11 h-11 rounded-lg"
                        fallbackTextClass="text-xs"
                      />
                      <span className="absolute inset-0 bg-surface-dim/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-primary text-lg"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          play_arrow
                        </span>
                      </span>
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">{entry.track.title}</p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {entry.track.artist} · {formatTime(entry.track.duration)}
                      </p>
                    </div>

                    <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <IconButton
                        icon="keyboard_arrow_up"
                        label={`Move ${entry.track.title} up`}
                        size="xs"
                        disabled={offset === 0}
                        onClick={() => actions.moveInQueue(queueIndex, queueIndex - 1)}
                      />
                      <IconButton
                        icon="keyboard_arrow_down"
                        label={`Move ${entry.track.title} down`}
                        size="xs"
                        disabled={offset === player.upNext.length - 1}
                        onClick={() => actions.moveInQueue(queueIndex, queueIndex + 1)}
                      />
                      <IconButton
                        icon="close"
                        label={`Remove ${entry.track.title} from the queue`}
                        size="xs"
                        onClick={() => actions.removeFromQueue(entry.key)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
};

export default QueuePanel;
