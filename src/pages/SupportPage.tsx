import React from 'react';
import { Link } from 'react-router-dom';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { artists, curatedPlaylists, tracks } from '../data/mockData';
import { pluralize } from '../lib/format';

export interface SupportPageProps {
  className?: string;
}

const FEATURES = [
  {
    icon: 'graphic_eq',
    title: 'Lossless, with a safety net',
    body: 'Tracks stream directly from the catalog. If a stream cannot be reached the player switches to a generative fallback voice so the transport, queue and lyrics keep working offline.',
  },
  {
    icon: 'queue_music',
    title: 'A queue you can actually edit',
    body: 'Play next, add to queue, reorder and remove — all from any track menu. Shuffle rebuilds the running order while holding your place, and switching it off restores the original sequence.',
  },
  {
    icon: 'lyrics',
    title: 'Time-synced lyrics',
    body: 'Selected tracks carry timed lyrics that follow the playhead. Click any line to jump straight to that moment.',
  },
  {
    icon: 'save',
    title: 'Your library stays yours',
    body: 'Likes, playlists, follows, history and even your playback position are stored in this browser. Nothing is uploaded anywhere.',
  },
];

/** Help, feature reference, and the shortcut cheat sheet. */
export const SupportPage: React.FC<Readonly<SupportPageProps>> = ({ className = '' }) => (
  <div className={`max-w-4xl ${className}`}>
    <header className="mb-12">
      <span className="text-tertiary font-bold tracking-[0.3em] text-[10px] uppercase mb-3 block">Support</span>
      <h1 className="text-5xl font-extrabold tracking-tight mb-3">How this player works</h1>
      <p className="text-on-surface-variant text-lg">
        {pluralize(tracks.length, 'track')} across {pluralize(artists.length, 'artist')} and{' '}
        {pluralize(curatedPlaylists.length, 'curated playlist')}.
      </p>
    </header>

    <section className="grid md:grid-cols-2 gap-6 mb-16">
      {FEATURES.map((feature) => (
        <article key={feature.title} className="bg-surface-container-low rounded-3xl p-8">
          <span className="material-symbols-outlined text-primary text-3xl mb-4 block">{feature.icon}</span>
          <h2 className="text-lg font-bold text-on-surface mb-2">{feature.title}</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">{feature.body}</p>
        </article>
      ))}
    </section>

    <section className="bg-surface-container-low rounded-3xl p-8 mb-16">
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

    <section className="bg-surface-container rounded-3xl p-10 text-center">
      <h2 className="text-2xl font-extrabold tracking-tight mb-3">Still stuck?</h2>
      <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">
        Playback settings and library management live in Settings. Resetting the library there clears everything stored
        in this browser and restores the defaults.
      </p>
      <Link
        to="/settings"
        className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined">settings</span>
        Open settings
      </Link>
    </section>
  </div>
);

export default SupportPage;
