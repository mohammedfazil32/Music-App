/**
 * Namespaced, fault-tolerant localStorage access.
 *
 * Every read is wrapped: private browsing, disabled site data and corrupt JSON
 * must degrade to defaults rather than blanking the app. Bump `VERSION` when a
 * persisted shape changes so stale payloads are ignored instead of crashing.
 */

const PREFIX = 'sonic-curator';
const VERSION = 'v1';

function keyFor(name: string): string {
  return `${PREFIX}:${name}:${VERSION}`;
}

export function loadState<T>(name: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(keyFor(name));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== 'object') return fallback;
    // Shallow-merge so newly added fields pick up their defaults.
    return { ...fallback, ...(parsed as object) } as T;
  } catch {
    return fallback;
  }
}

export function saveState(name: string, value: unknown): void {
  try {
    window.localStorage.setItem(keyFor(name), JSON.stringify(value));
  } catch {
    // Quota exceeded or storage blocked — persistence is a nicety, not a
    // requirement, so drop the write silently.
  }
}

export function clearState(name: string): void {
  try {
    window.localStorage.removeItem(keyFor(name));
  } catch {
    // See above.
  }
}
