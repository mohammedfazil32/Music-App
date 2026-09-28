import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../../context/libraryStore';
import { useToast } from '../../context/toastStore';
import { currentUser } from '../../data/mockData';
import { GLOBAL_SEARCH_INPUT_ID } from '../../hooks/useKeyboardShortcuts';
import Artwork from '../ui/Artwork';
import IconButton from '../ui/IconButton';

export interface HeaderProps {
  className?: string;
}

/**
 * Top bar: history controls, global search, and account actions.
 *
 * The search field is the app's single search entry point — typing routes to
 * `/search?q=…` so results are linkable and survive a reload.
 */
export const Header: React.FC<Readonly<HeaderProps>> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addSearchTerm } = useLibrary();
  const { notify } = useToast();

  const onSearchPage = location.pathname === '/search';
  // The URL is the single source of truth for the query: every keystroke
  // navigates, so back/forward and shared links stay in step with the field
  // without mirroring anything into local state.
  const value = searchParams.get('q') ?? '';

  const runSearch = (next: string) => {
    const target = next.trim() ? `/search?q=${encodeURIComponent(next)}` : '/search';
    // Replace while already searching so the back button doesn't step through
    // every keystroke.
    navigate(target, { replace: onSearchPage });
  };

  return (
    <header
      className={`fixed top-0 right-0 w-[calc(100%-16rem)] flex justify-between items-center gap-6 px-8 py-4 z-40 bg-background/80 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <IconButton icon="arrow_back" label="Go back" size="sm" variant="tonal" onClick={() => navigate(-1)} />
        <IconButton icon="arrow_forward" label="Go forward" size="sm" variant="tonal" onClick={() => navigate(1)} />

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (value.trim()) addSearchTerm(value);
            runSearch(value);
          }}
          className="flex items-center bg-surface-container-highest rounded-full px-4 py-2 w-96 ml-4 focus-within:ring-2 focus-within:ring-primary/40 transition-shadow"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
          <input
            id={GLOBAL_SEARCH_INPUT_ID}
            type="search"
            value={value}
            onChange={(event) => runSearch(event.target.value)}
            onBlur={() => {
              if (value.trim()) addSearchTerm(value);
            }}
            className="bg-transparent border-none text-sm text-on-surface placeholder:text-on-surface-variant w-full font-body ml-3 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            placeholder="Search artists, tracks, or curators..."
            aria-label="Search the catalog"
          />
          {value && (
            <button
              type="button"
              onClick={() => runSearch('')}
              aria-label="Clear search"
              className="text-on-surface-variant hover:text-on-surface shrink-0"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </form>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 px-3 py-1 rounded-full">
          {currentUser.tier}
        </span>

        <div className="flex items-center gap-1">
          <IconButton
            icon="notifications"
            label="Notifications"
            size="sm"
            onClick={() => notify('You are all caught up', { icon: 'notifications' })}
          />
          <IconButton icon="equalizer" label="Audio settings" size="sm" onClick={() => navigate('/settings')} />
        </div>

        <Link
          to="/settings"
          aria-label={`Account: ${currentUser.name}`}
          className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all shrink-0"
        >
          <Artwork
            src={currentUser.avatar}
            alt={currentUser.name}
            seed={currentUser.handle}
            className="w-10 h-10 rounded-full"
            fallbackTextClass="text-sm"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
