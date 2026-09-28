import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LibraryProvider from './context/LibraryProvider';
import PlayerProvider from './context/PlayerProvider';
import ToastProvider from './context/ToastProvider';
import UiProvider from './context/UiProvider';
import AlbumPage from './pages/AlbumPage';
import ArtistPage from './pages/ArtistPage';
import GenrePage from './pages/GenrePage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import LikedSongsPage from './pages/LikedSongsPage';
import NotFoundPage from './pages/NotFoundPage';
import NowPlayingPage from './pages/NowPlayingPage';
import PlaylistPage from './pages/PlaylistPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';

/**
 * Provider order matters:
 * - Toast is outermost so anything can raise a notification.
 * - Library sits above Player, which calls into it to record plays.
 * - Layout is inside all of them: it mounts the transport, the queue, the
 *   dialogs and the global keyboard shortcuts.
 */
function App() {
  return (
    <Router>
      <ToastProvider>
        <LibraryProvider>
          <UiProvider>
            <PlayerProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/liked" element={<LikedSongsPage />} />
                  <Route path="/player" element={<NowPlayingPage />} />
                  <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
                  <Route path="/album/:albumId" element={<AlbumPage />} />
                  <Route path="/artist/:artistId" element={<ArtistPage />} />
                  <Route path="/genre/:genreId" element={<GenrePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </PlayerProvider>
          </UiProvider>
        </LibraryProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
