import React from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/libraryStore';
import { usePlayer, usePlayerActions } from '../context/playerStore';
import { artists, curatedPlaylists, heroFeature, weeklyMixArtwork } from '../data/mockData';
import { useCollectionPlayback } from '../hooks/useCollectionPlayback';
import {
  getAlbumTracks,
  getCuratedPlaylist,
  getNewReleases,
  getTracks,
  getTrendingTracks,
  playlistCover,
  totalDuration,
} from '../lib/catalog';
import { formatCount, formatTotalDuration } from '../lib/format';
import type { PlaybackSource } from '../types';
import MediaCard from '../components/media/MediaCard';
import TrackList from '../components/media/TrackList';
import Artwork from '../components/ui/Artwork';
import SectionHeader from '../components/ui/SectionHeader';

export interface HomePageProps {
  className?: string;
}

const playlistSource = (id: string, title: string): PlaybackSource => ({
  kind: 'playlist',
  id,
  title,
  href: `/playlist/${id}`,
});

const RECENT_SOURCE: PlaybackSource = { kind: 'mix', id: 'recently-played', title: 'Recently played' };

/** Editorial landing page: spotlight, personalised mixes, trending, releases. */
export const HomePage: React.FC<Readonly<HomePageProps>> = ({ className = '' }) => {
  const { play, isPlayingSource } = useCollectionPlayback();
  const { playTracks } = usePlayerActions();
  const { currentTrack } = usePlayer();
  const { recentTrackIds } = useLibrary();

  const hero = getCuratedPlaylist(heroFeature.playlistId);
  const heroTracks = hero ? getTracks(hero.trackIds) : [];
  const heroSource = playlistSource(heroFeature.playlistId, heroFeature.title);
  const heroPlaying = isPlayingSource(heroSource);

  const weekly = getCuratedPlaylist('pl-daily-lift');
  const weeklyTracks = weekly ? getTracks(weekly.trackIds) : [];
  const weeklySource = playlistSource('pl-daily-lift', 'Discover Weekly');

  const trending = getTrendingTracks(6);
  const recent = getTracks(recentTrackIds).slice(0, 6);
  const releases = getNewReleases(6);
  const mixes = curatedPlaylists.filter((playlist) => playlist.id !== heroFeature.playlistId).slice(0, 5);

  return (
    <div className={className}>
      {/* Hero spotlight (bento) */}
      <section className="grid grid-cols-12 gap-6 mb-16 h-[450px]">
        <div className="col-span-12 lg:col-span-8 relative rounded-3xl overflow-hidden group bg-surface-container shadow-2xl">
          <Artwork
            src={heroFeature.image}
            alt={heroFeature.title}
            seed={heroFeature.playlistId}
            className="absolute inset-0 w-full h-full opacity-60"
            imageClassName="group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/30 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 max-w-lg">
            <span className="text-tertiary font-bold tracking-[0.3em] text-[10px] uppercase mb-4 block">
              {heroFeature.eyebrow}
            </span>
            <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tighter text-on-surface mb-4 leading-tight">
              {heroFeature.title}
            </h2>
            <p className="text-on-surface-variant text-base font-medium mb-6 leading-relaxed">{heroFeature.blurb}</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => play(heroTracks, heroSource)}
                className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {heroPlaying ? 'pause' : 'play_arrow'}
                </span>
                {heroPlaying ? 'Pause' : 'Listen Now'}
              </button>
              <Link
                to={`/playlist/${heroFeature.playlistId}`}
                className="text-sm font-bold text-on-surface hover:text-primary transition-colors"
              >
                View tracklist
              </Link>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
          {/* Weekly pulse */}
          <div className="bg-surface-container-high rounded-3xl p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-primary font-bold tracking-widest text-[10px] uppercase mb-2 block">
                Weekly Pulse
              </span>
              <h3 className="text-2xl font-bold text-on-surface leading-tight mb-4">
                Your personalised Discover Weekly is ready.
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {weeklyMixArtwork.map((art, index) => (
                    <Artwork
                      key={index}
                      src={art}
                      alt="Mix artwork"
                      seed={`weekly-${index}`}
                      className="w-8 h-8 rounded-full ring-2 ring-surface-container-high"
                      fallbackTextClass="text-[8px]"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => play(weeklyTracks, weeklySource)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {isPlayingSource(weeklySource) ? 'Pause mix' : 'Play mix'}
                </button>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 pointer-events-none">
              <span className="material-symbols-outlined text-9xl text-primary">auto_awesome</span>
            </div>
          </div>

          {/* Lossless */}
          <div className="bg-surface-container rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Lossless High-Fidelity</h3>
              <p className="text-on-surface-variant text-sm mt-2">
                Experience sound as the artist intended. Now with 24-bit/192kHz support.
              </p>
            </div>
            <Link to="/support" className="text-tertiary text-sm font-bold flex items-center gap-2 group w-fit">
              Explore technology
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Jump back in */}
      {recent.length > 0 && (
        <section className="mb-16">
          <SectionHeader
            title="Jump back in"
            subtitle="Picked up from where you left off"
            actionLabel="Your library"
            actionTo="/library"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
            {recent.map((track, index) => (
              <MediaCard
                key={track.id}
                to={`/album/${track.albumId}`}
                title={track.title}
                subtitle={track.artist}
                artwork={track.artwork}
                seed={track.albumId}
                isPlaying={isPlayingSource(RECENT_SOURCE) && currentTrack?.id === track.id}
                // Queue the whole history from here, so playback carries on
                // instead of stopping after one track.
                onPlay={() => playTracks(recent, index, RECENT_SOURCE)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Personalised mixes */}
      <section className="mb-16">
        <SectionHeader
          title="Personalised Mixes"
          subtitle="Based on your recent listening habits"
          actionLabel="Browse all"
          actionTo="/search"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {mixes.map((playlist) => {
            const source = playlistSource(playlist.id, playlist.title);
            return (
              <MediaCard
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                title={playlist.title}
                subtitle={playlist.description}
                artwork={playlistCover(playlist)}
                seed={playlist.id}
                icon="queue_music"
                isPlaying={isPlayingSource(source)}
                onPlay={() => play(getTracks(playlist.trackIds), source)}
              />
            );
          })}
        </div>
      </section>

      {/* Trending now */}
      <section className="mb-16">
        <SectionHeader
          title="Trending Now"
          subtitle={`Most played across the catalog · ${formatTotalDuration(totalDuration(trending))}`}
        />
        <TrackList
          tracks={trending}
          source={{ kind: 'mix', id: 'trending', title: 'Trending Now' }}
          metaLabel="Plays"
          metaFor={(track) => formatCount(track.plays)}
        />
      </section>

      {/* Trending artists */}
      <section className="mb-16">
        <SectionHeader title="Trending Artists" subtitle="Most streamed worldwide this week" />
        <div className="flex gap-10 overflow-x-auto pb-4 no-scrollbar">
          {artists.map((artist) => (
            <div key={artist.id} className="w-36 shrink-0">
              <MediaCard
                to={`/artist/${artist.id}`}
                title={artist.name}
                subtitle={`${formatCount(artist.monthlyListeners)} listeners`}
                artwork={artist.image}
                seed={artist.id}
                round
              />
            </div>
          ))}
        </div>
      </section>

      {/* New releases */}
      <section>
        <SectionHeader title="New Releases" subtitle="Fresh from the curators' desk" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {releases.map((album) => {
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
      </section>
    </div>
  );
};

export default HomePage;
