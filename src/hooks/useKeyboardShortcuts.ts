import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/libraryStore';
import { usePlayer, usePlayerActions } from '../context/playerStore';
import { useUi } from '../context/uiStore';

/** Id of the header search field, so `/` can focus it from anywhere. */
export const GLOBAL_SEARCH_INPUT_ID = 'global-search';

export interface Shortcut {
  keys: string;
  label: string;
}

/** Documented on the Support page — keep in sync with the handler below. */
export const SHORTCUTS: Shortcut[] = [
  { keys: 'Space / K', label: 'Play or pause' },
  { keys: '→ / ←', label: 'Seek forward or back 5 seconds' },
  { keys: 'Shift + → / ←', label: 'Next or previous track' },
  { keys: '↑ / ↓', label: 'Volume up or down' },
  { keys: 'M', label: 'Mute' },
  { keys: 'S', label: 'Toggle shuffle' },
  { keys: 'R', label: 'Cycle repeat mode' },
  { keys: 'L', label: 'Like the current track' },
  { keys: 'Q', label: 'Show or hide the queue' },
  { keys: '/', label: 'Focus search' },
  { keys: 'Esc', label: 'Close the queue or a dialog' },
];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Global transport shortcuts. Mounted once, from `Layout`.
 *
 * Keystrokes are ignored while the user is typing, and any combination using
 * Ctrl/Cmd/Alt is left to the browser.
 */
export function useKeyboardShortcuts(): void {
  const player = usePlayer();
  const actions = usePlayerActions();
  const { toggleTrackLike } = useLibrary();
  const { toggleQueue, setQueueOpen, closeAddToPlaylist, closeCreatePlaylist } = useUi();
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === 'Escape') {
        setQueueOpen(false);
        closeAddToPlaylist();
        closeCreatePlaylist();
        return;
      }

      if (isTypingTarget(event.target)) return;

      switch (event.key) {
        case ' ':
        case 'k':
        case 'K':
          event.preventDefault();
          actions.toggle();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (event.shiftKey) actions.next();
          else actions.seekBy(5);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (event.shiftKey) actions.previous();
          else actions.seekBy(-5);
          break;
        case 'ArrowUp':
          event.preventDefault();
          actions.setVolume(player.volume + 0.05);
          break;
        case 'ArrowDown':
          event.preventDefault();
          actions.setVolume(player.volume - 0.05);
          break;
        case 'm':
        case 'M':
          actions.toggleMute();
          break;
        case 's':
        case 'S':
          actions.toggleShuffle();
          break;
        case 'r':
        case 'R':
          actions.cycleRepeat();
          break;
        case 'l':
        case 'L':
          if (player.currentTrack) toggleTrackLike(player.currentTrack);
          break;
        case 'q':
        case 'Q':
          toggleQueue();
          break;
        case '/':
          event.preventDefault();
          navigate('/search');
          // The field mounts on the next frame when arriving from another route.
          requestAnimationFrame(() => {
            document.getElementById(GLOBAL_SEARCH_INPUT_ID)?.focus();
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    actions,
    player.volume,
    player.currentTrack,
    toggleTrackLike,
    toggleQueue,
    setQueueOpen,
    closeAddToPlaylist,
    closeCreatePlaylist,
    navigate,
  ]);
}
