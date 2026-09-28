import React, { useState } from 'react';
import Modal from '../components/ui/Modal';
import Slider from '../components/ui/Slider';
import { useLibrary } from '../context/libraryStore';
import { usePlayer, usePlayerActions } from '../context/playerStore';
import { currentUser, tracks } from '../data/mockData';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { pluralize } from '../lib/format';

export interface SettingsPageProps {
  className?: string;
}

/** Playback preferences, library data management, and shortcut reference. */
export const SettingsPage: React.FC<Readonly<SettingsPageProps>> = ({ className = '' }) => {
  const player = usePlayer();
  const actions = usePlayerActions();
  const { likedTrackIds, playlists, followedArtistIds, recentTrackIds, resetLibrary } = useLibrary();
  const [confirmReset, setConfirmReset] = useState(false);

  const rows = [
    { label: 'Liked tracks', value: String(likedTrackIds.length) },
    { label: 'Your playlists', value: String(playlists.length) },
    { label: 'Artists followed', value: String(followedArtistIds.length) },
    { label: 'Recently played', value: String(recentTrackIds.length) },
    { label: 'Catalog size', value: pluralize(tracks.length, 'track') },
  ];

  return (
    <div className={`max-w-4xl ${className}`}>
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">Settings</h1>
        <p className="text-on-surface-variant text-lg">
          Signed in as {currentUser.name} · {currentUser.tier}
        </p>
      </header>

      {/* Playback */}
      <section className="bg-surface-container-low rounded-3xl p-8 mb-6">
        <h2 className="text-xl font-bold mb-1">Playback</h2>
        <p className="text-on-surface-variant text-sm mb-8">
          These apply immediately and are remembered for your next visit.
        </p>

        <div className="space-y-8">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label htmlFor="settings-volume" className="text-sm font-bold text-on-surface">
                Volume
              </label>
              <span className="text-sm font-bold text-primary tabular-nums">
                {player.muted ? 'Muted' : `${Math.round(player.volume * 100)}%`}
              </span>
            </div>
            <Slider
              value={player.muted ? 0 : Math.round(player.volume * 100)}
              max={100}
              live
              step={5}
              ariaLabel="Volume"
              onChange={(next) => actions.setVolume(next / 100)}
              onCommit={(next) => actions.setVolume(next / 100)}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-on-surface">Shuffle</p>
              <p className="text-on-surface-variant text-sm">Randomise the order of the current queue.</p>
            </div>
            <button
              type="button"
              onClick={actions.toggleShuffle}
              aria-pressed={player.shuffle}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                player.shuffle
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {player.shuffle ? 'On' : 'Off'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-on-surface">Repeat</p>
              <p className="text-on-surface-variant text-sm">Cycle between off, the whole queue, and one track.</p>
            </div>
            <button
              type="button"
              onClick={actions.cycleRepeat}
              className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all active:scale-95 ${
                player.repeat === 'off'
                  ? 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  : 'bg-tertiary-container text-on-tertiary-container'
              }`}
            >
              {player.repeat === 'off' ? 'Off' : player.repeat === 'all' ? 'Queue' : 'One track'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-on-surface">Audio source</p>
              <p className="text-on-surface-variant text-sm">
                {player.mode === 'synth'
                  ? 'The stream could not be reached, so the generative fallback voice is playing.'
                  : 'Streaming the catalog audio directly.'}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shrink-0 ${
                player.mode === 'synth'
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {player.mode === 'synth' ? 'Fallback' : 'Stream'}
            </span>
          </div>
        </div>
      </section>

      {/* Library data */}
      <section className="bg-surface-container-low rounded-3xl p-8 mb-6">
        <h2 className="text-xl font-bold mb-1">Your data</h2>
        <p className="text-on-surface-variant text-sm mb-8">
          Likes, playlists, follows and history are stored in this browser only.
        </p>

        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {rows.map((row) => (
            <div key={row.label} className="bg-surface-container-high rounded-2xl px-5 py-4">
              <dt className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{row.label}</dt>
              <dd className="text-2xl font-extrabold text-on-surface mt-1">{row.value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="px-6 py-3 rounded-full text-sm font-bold bg-error-container text-on-error-container hover:opacity-90 active:scale-95 transition-all"
        >
          Reset library to defaults
        </button>
      </section>

      {/* Shortcuts */}
      <section className="bg-surface-container-low rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-1">Keyboard shortcuts</h2>
        <p className="text-on-surface-variant text-sm mb-8">Available anywhere except while typing in a field.</p>
        <ul className="grid md:grid-cols-2 gap-x-10 gap-y-3">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.keys} className="flex items-center justify-between gap-4">
              <span className="text-sm text-on-surface-variant">{shortcut.label}</span>
              <kbd className="shrink-0 px-3 py-1 rounded-lg bg-surface-container-highest text-xs font-bold text-on-surface">
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </section>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset your library?"
        description="Your likes, playlists, follows and history in this browser will be replaced with the defaults."
        footer={
          <>
            <button
              type="button"
              data-modal-close
              onClick={() => setConfirmReset(false)}
              className="px-5 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetLibrary();
                setConfirmReset(false);
              }}
              className="px-6 py-3 rounded-full text-sm font-bold bg-error-container text-on-error-container hover:opacity-90 active:scale-95 transition-all"
            >
              Reset library
            </button>
          </>
        }
      />
    </div>
  );
};

export default SettingsPage;
