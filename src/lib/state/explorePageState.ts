import type { TMDBMovieListItem } from '$lib/server/tmdb/controller';

interface ExplorePageSnapshot {
  visibleMovies: TMDBMovieListItem[];
  nextPage: number;
  totalPages: number;
}

const MAX_CACHED_QUERIES = 12;
const explorePageSnapshots = new Map<string, ExplorePageSnapshot>();

export function getExplorePageSnapshot(key: string) {
  const snapshot = explorePageSnapshots.get(key);

  if (!snapshot) {
    return null;
  }

  // Refresh insertion order so the cache stays roughly LRU.
  explorePageSnapshots.delete(key);
  explorePageSnapshots.set(key, snapshot);

  return {
    visibleMovies: [...snapshot.visibleMovies],
    nextPage: snapshot.nextPage,
    totalPages: snapshot.totalPages
  };
}

export function setExplorePageSnapshot(key: string, snapshot: ExplorePageSnapshot) {
  explorePageSnapshots.set(key, {
    visibleMovies: [...snapshot.visibleMovies],
    nextPage: snapshot.nextPage,
    totalPages: snapshot.totalPages
  });

  if (explorePageSnapshots.size <= MAX_CACHED_QUERIES) {
    return;
  }

  const oldestKey = explorePageSnapshots.keys().next().value;

  if (oldestKey) {
    explorePageSnapshots.delete(oldestKey);
  }
}
