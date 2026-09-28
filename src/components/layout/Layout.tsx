import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import AddToPlaylistDialog from '../media/AddToPlaylistDialog';
import CreatePlaylistDialog from '../media/CreatePlaylistDialog';
import NowPlayingBar from '../player/NowPlayingBar';
import QueuePanel from '../player/QueuePanel';
import Header from './Header';
import Sidebar from './Sidebar';

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Application shell.
 *
 * The transport, queue and dialogs live here rather than inside any route, so
 * audio and queue state survive navigation. Layout offsets are coupled to the
 * fixed chrome: `Sidebar` is `w-64`, `Header` is `h-24`-ish, and the floating
 * `NowPlayingBar` needs the bottom padding — change one, change all three.
 */
export const Layout: React.FC<Readonly<LayoutProps>> = ({ children, className = '' }) => {
  const location = useLocation();
  useKeyboardShortcuts();

  // Every route starts at the top rather than inheriting the previous scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className={`dark bg-background text-on-surface min-h-screen ${className}`}>
      <Sidebar />
      <Header />

      <main className="ml-64 pt-24 pb-32 px-10 min-h-screen bg-surface-container-lowest">{children}</main>

      <NowPlayingBar />
      <QueuePanel />
      <CreatePlaylistDialog />
      <AddToPlaylistDialog />
    </div>
  );
};

export default Layout;
