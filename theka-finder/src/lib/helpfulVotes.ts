/**
 * Tracks which reviews this browser has marked helpful.
 *
 * Exposed as an external store rather than component state so that reading
 * it during render is safe: the server snapshot is empty, the client
 * snapshot comes from localStorage, and React reconciles the two without a
 * hydration mismatch or a setState-in-effect.
 */

const STORAGE_KEY = "theka:helpful";
const EMPTY = "[]";

const listeners = new Set<() => void>();
let cache: string | null = null;

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? EMPTY;
  } catch {
    // Private mode / storage disabled — votes just won't persist.
    return EMPTY;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Votes made in another tab should show up here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Must return a stable reference between changes, so it caches the raw string. */
export function getSnapshot(): string {
  if (cache === null) cache = read();
  return cache;
}

export function getServerSnapshot(): string {
  return EMPTY;
}

export function hasVoted(snapshot: string, reviewId: string): boolean {
  try {
    return (JSON.parse(snapshot) as string[]).includes(reviewId);
  } catch {
    return false;
  }
}

export function recordVote(reviewId: string): void {
  let ids: string[] = [];
  try {
    ids = JSON.parse(getSnapshot()) as string[];
  } catch {
    ids = [];
  }
  if (!ids.includes(reviewId)) ids.push(reviewId);
  const next = JSON.stringify(ids);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Non-fatal: the vote still counted on the server.
  }
  cache = next;
  for (const listener of listeners) listener();
}
