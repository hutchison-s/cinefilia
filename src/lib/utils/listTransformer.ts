export type SortMode =
  | 'newestYear'
  | 'oldestYear'
  | 'recentlyWatched'
  | 'highestRated'
  | 'lowestRated'
  | 'titleAZ'
  | 'titleZA';

export interface FilterOptions {
  yearRange: number[] | null;
  ratings: number[] | null;
  searchQuery: string;
}

export function applyListTransform<T extends {
  id: string;
  title: string;
  releaseYear?: number;
  posterPath: string;
  rating: number;
  watchedAt?: string;
}>(
  items: T[],
  filters: FilterOptions,
  sortMode: SortMode
) {
  let result = [...items];

  // Search
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter((item) =>
      item.title?.toLowerCase().includes(q)
    );
  }

  // Year
  if (filters.yearRange) {
    const [min, max] = filters.yearRange;
    result = result.filter((item) =>
      item.releaseYear != null &&
      item.releaseYear >= min &&
      item.releaseYear <= max
    );
  }

  // Ratings
  if (filters.ratings?.length) {
    result = result.filter((item) => {
      if (!item.rating) return false;
      return filters.ratings!.includes(
        Math.floor(item.rating)
      );
    });
  }

  // Sort
  result.sort((a, b) => {
    switch (sortMode) {
      case 'newestYear':
        return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
      case 'oldestYear':
        return (a.releaseYear ?? 0) - (b.releaseYear ?? 0);
      case 'recentlyWatched':
        return (
          (new Date(b.watchedAt ?? 0).getTime() || 0) -
          (new Date(a.watchedAt ?? 0).getTime() || 0)
        );
      case 'highestRated':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'lowestRated':
        return (a.rating ?? 0) - (b.rating ?? 0);
      case 'titleAZ':
        return (a.title ?? '').localeCompare(b.title ?? '');
      case 'titleZA':
        return (b.title ?? '').localeCompare(a.title ?? '');
      default:
        return 0;
    }
  });

  return result;
}
