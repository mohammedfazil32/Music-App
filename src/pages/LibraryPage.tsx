import React from 'react';
import { useSearchParams } from 'react-router-dom';
import MediaCard from '../components/media/MediaCard';
import TrackList from '../components/media/TrackList';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import { useLibrary } from '../context/libraryStore';
import { useUi } from '../context/uiStore';
import { useCollectionPlayback } from '../hooks/useCollectionPlayback';
import {
  getAlbum,
  getAlbumTracks,
  getArtist,
  getArtistTracks,
  getTracks,
  playlistCover,
  totalDuration,
} from '../lib/catalog';
import { formatRelativeDate, formatTotalDuration, pluralize } from '../lib/format';
import type { PlaybackSource } from '../types';

export interface LibraryPageProps {
  className?: string;
}

const TABS = ['Liked Songs', 'Playlists', 'Followed Artists', 'Albums'] as const;
type Tab = (typeof TABS)[number];

const LIKED_SOURCE: PlaybackSource = { kind: 'liked', id: 'liked', title: 'Liked Songs', href: '/liked' };

/** Everything the listener has saved, grouped into tabs kept in the URL. */
export const LibraryPage: React.FC<Readonly<LibraryPageProps>> = ({ className = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { likedTrackIds, likedAt, likedAlbumIds, followedArtistIds, playlists } = useLibrary();
  const { openCreatePlaylist } = useUi();
  const { play, isPlayingSource } = useCollectionPlayback();

  const requested = searchParams.get('tab');
  const activeTab: Tab = TABS.find((tab) => tab === requested) ?? 'Liked Songs';
  const setTab = (tab: Tab) => setSearchParams(tab === 'Liked Songs' ? {} : { tab }, { replace: true });

  const likedTracks = getTracks(likedTrackIds);
  const followedArtists = followedArtistIds.map((id) => getArtist(id)).filter((artist) => artist !== undefined);
  const likedAlbums = likedAlbumIds.map((id) => getAlbum(id)).filter((album) => album !== undefined);

  return (
    <div className={className}>
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex justify-between items-end gap-6 flex-wrap">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">My Library</h1>
            <p className="text-on-surface-variant text-lg">
              {pluralize(likedTracks.length, 'liked track')} · {pluralize(playlists.length, 'playlist')} ·{' '}
              {formatTotalDuration(totalDuration(likedTracks))} saved
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCreatePlaylist()}
            className="group flex items-center gap-2 bg-surface-container-high hover:bg-surface-bright text-on-surface px-6 py-3 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="font-bold text-sm">Create new playlist</span>
          </button>
        </div>

        <div className="flex gap-8 flex-wrap" role="tablist" aria-label="Library sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setTab(tab)}
              className={`pb-4 text-sm tracking-wide transition-colors ${
                activeTab === tab
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface font-semibold border-b-2 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Liked Songs' && (
        <section>
          <SectionHeader
            title="Recently liked"
            subtitle={
              likedTracks.length > 0
                ? `${pluralize(likedTracks.length, 'track')} · ${formatTotalDuration(totalDuration(likedTracks))}`
                : undefined
            }
            size="md"
            actionLabel={likedTracks.length > 5 ? 'View all' : undefined}
            actionTo="/liked"
          />
          <TrackList
            tracks={likedTracks.slice(0, 5)}
            source={LIKED_SOURCE}
            metaLabel="Date added"
            metaFor={(track) => (likedAt[track.id] ? formatRelativeDate(likedAt[track.id]) : '—')}
            emptyIcon="favorite"
            emptyTitle="No liked songs yet"
            emptyDescription="Tap the heart on any track and it will collect here."
          />
        </section>
      )}

      {activeTab === 'Playlists' && (
        <section>
          {playlists.length === 0 ? (
            <EmptyState
              icon="queue_music"
              title="No playlists yet"
              description="Build your first collection — you can add tracks from any list."
              actionLabel="Create a playlist"
              onAction={() => openCreatePlaylist()}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {playlists.map((playlist) => {
                const source: PlaybackSource = {
                  kind: 'playlist',
                  id: playlist.id,
                  title: playlist.title,
                  href: `/playlist/${playlist.id}`,
                };
                const tracks = getTracks(playlist.trackIds);
                return (
                  <MediaCard
                    key={playlist.id}
                    to={`/playlist/${playlist.id}`}
                    title={playlist.title}
                    subtitle={`${pluralize(tracks.length, 'track')} · ${formatTotalDuration(totalDuration(tracks))}`}
                    artwork={playlistCover(playlist)}
                    seed={playlist.id}
                    icon="queue_music"
                    isPlaying={isPlayingSource(source)}
                    onPlay={() => play(tracks, source)}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'Followed Artists' && (
        <section>
          {followedArtists.length === 0 ? (
            <EmptyState
              icon="person_add"
              title="You are not following anyone yet"
              description="Follow an artist from their page to see them here."
            />
          ) : (
            <div className="flex gap-10 flex-wrap">
              {followedArtists.map((artist) => {
                const source: PlaybackSource = {
                  kind: 'artist',
                  id: artist.id,
                  title: artist.name,
                  href: `/artist/${artist.id}`,
                };
                return (
                  <div key={artist.id} className="w-36">
                    <MediaCard
                      to={`/artist/${artist.id}`}
                      title={artist.name}
                      subtitle={artist.genres[0]}
                      artwork={artist.image}
                      seed={artist.id}
                      round
                      isPlaying={isPlayingSource(source)}
                      onPlay={() => play(getArtistTracks(artist.id), source)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'Albums' && (
        <section>
          {likedAlbums.length === 0 ? (
            <EmptyState
              icon="library_add"
              title="No saved albums"
              description="Save an album from its page to keep it in your library."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {likedAlbums.map((album) => {
                const source: PlaybackSource = {
                  kind: 'album',
                  id: album.id,
                  title: album.title,
                  href: `/album/${album.id}`,
                };
                return (
                  <MediaCard
                    key={album.id}
                    to={`/album/${album.id}`}
                    title={album.title}
                    subtitle={`${album.artist} · ${album.year}`}
                    artwork={album.artwork}
                    seed={album.id}
                    isPlaying={isPlayingSource(source)}
                    onPlay={() => play(getAlbumTracks(album.id), source)}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default LibraryPage;
