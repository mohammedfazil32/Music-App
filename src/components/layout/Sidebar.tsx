import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLibrary } from '../../context/libraryStore';
import { useUi } from '../../context/uiStore';
import { navigationItems } from '../../data/mockData';
import { pluralize } from '../../lib/format';

export interface SidebarProps {
  className?: string;
}

/**
 * Primary navigation.
 *
 * Separated from the content well by a tonal shift (`background` against
 * `surface-container-lowest`) rather than a border, per the no-line rule.
 */
export const Sidebar: React.FC<Readonly<SidebarProps>> = ({ className = '' }) => {
  const location = useLocation();
  const { playlists } = useLibrary();
  const { openCreatePlaylist } = useUi();

  return (
    <aside
      className={`h-screen w-64 fixed left-0 top-0 bg-background flex flex-col py-8 z-50 ${className}`}
      aria-label="Main navigation"
    >
      {/* Branding */}
      <Link to="/" className="px-8 mb-10 block shrink-0">
        <h1 className="text-2xl font-bold tracking-tighter text-on-surface">The Sonic Curator</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-tertiary font-bold mt-1">Premium Tier</p>
      </Link>

      {/* Main navigation */}
      <nav className="px-4 space-y-1 shrink-0">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-4 py-3 pl-4 rounded-r-lg font-body tracking-tight font-medium transition-colors duration-200 ${
                isActive
                  ? 'text-primary font-bold border-l-4 border-primary-container bg-surface-container-low'
                  : 'text-on-surface-variant hover:bg-surface-container-highest border-l-4 border-transparent'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User playlists */}
      <div className="mt-8 px-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-4 mb-3 shrink-0">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Your playlists</h2>
          <button
            type="button"
            onClick={() => openCreatePlaylist()}
            aria-label="Create a new playlist"
            title="Create a new playlist"
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar space-y-0.5">
          {playlists.length === 0 ? (
            <p className="px-4 text-xs text-on-surface-variant/70 leading-relaxed">
              No playlists yet. Use + to make your first one.
            </p>
          ) : (
            playlists.map((playlist) => {
              const isActive = location.pathname === `/playlist/${playlist.id}`;
              return (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className={`block px-4 py-2 rounded-lg text-sm truncate transition-colors ${
                    isActive
                      ? 'text-primary font-bold bg-surface-container-low'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                  }`}
                  title={`${playlist.title} — ${pluralize(playlist.trackIds.length, 'track')}`}
                >
                  {playlist.title}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Upgrade */}
      <div className="px-8 my-6 shrink-0">
        <Link
          to="/support"
          className="block w-full py-3 bg-primary-container text-on-primary-container rounded-full text-xs font-bold tracking-tight text-center scale-95 transition-transform hover:scale-100 active:scale-95"
        >
          Upgrade to Lossless
        </Link>
      </div>

      {/* Secondary navigation */}
      <div className="px-4 space-y-1 shrink-0">
        {[
          { to: '/settings', icon: 'settings', label: 'Settings' },
          { to: '/support', icon: 'help_outline', label: 'Support' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-4 py-2 pl-4 text-sm font-body rounded-lg transition-colors duration-200 ${
              location.pathname === item.to
                ? 'text-primary font-bold bg-surface-container-low'
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
