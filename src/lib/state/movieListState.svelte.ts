import { applyListTransform, type SortMode } from '$lib/utils/listTransformer';

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

export interface MovieListItem {
  id: string | number;
  title: string;
  posterPath?: string;
  releaseYear?: number;
  rating: number;
  watchedAt?: string;
}

export interface MovieListConfig {
  defaultSort?: SortMode;
  yearMin?: number;
  yearMax?: number;
}

/* ---------------------------------- */
/* Factory                            */
/* ---------------------------------- */

export function createMovieListState<T extends MovieListItem>(
  items: T[],
  config?: MovieListConfig
) {
  const yearMin = config?.yearMin ?? 1900;
  const yearMax = config?.yearMax ?? new Date().getFullYear();
  const defaultSort = config?.defaultSort ?? 'recentlyWatched';

  /* -------------------- UI Toggles -------------------- */

  let showSearch = $state(false);
  let showFilters = $state(false);
  let showSort = $state(false);

  /* -------------------- Search -------------------- */

  let searchQuery = $state('');

  /* -------------------- Sorting -------------------- */

  let sortMode = $state<SortMode>(defaultSort);

  /* -------------------- Filters -------------------- */

  let filterValues = $state({
    yearRange: [yearMin, yearMax] as [number, number],
    ratings: [] as number[]
  });

  let filters = $state({
    yearRange: null as [number, number] | null,
    ratings: null as number[] | null
  });

  /* -------------------- Derived Flags -------------------- */

  let isSearching = $derived(
    searchQuery.trim().length > 0
  );

  let isSorting = $derived(
    sortMode !== defaultSort
  );

  let isFiltering = $derived.by(() => {
    const yearActive =
      filters.yearRange !== null &&
      (
        filters.yearRange[0] !== yearMin ||
        filters.yearRange[1] !== yearMax
      );

    const ratingActive =
      filters.ratings !== null &&
      filters.ratings.length > 0;

    return yearActive || ratingActive;
  });

  /* -------------------- Derived Items -------------------- */

  let filteredItems = $derived.by(() =>
    applyListTransform(
      items,
      {
        yearRange: filters.yearRange,
        ratings: filters.ratings,
        searchQuery
      },
      sortMode
    )
  );

  /* -------------------- Actions -------------------- */

  function toggleSearch() {
    showSearch = !showSearch;
    showFilters = false;
    showSort = false;
  }

  function toggleFilters() {
    showFilters = !showFilters;
    showSearch = false;
    showSort = false;
  }

  function toggleSort() {
    showSort = !showSort;
    showSearch = false;
    showFilters = false;
  }

  function applyFilters() {
    const [min, max] = filterValues.yearRange;

    filters.yearRange =
      min === yearMin && max === yearMax
        ? null
        : [min, max];

    filters.ratings =
      filterValues.ratings.length > 0
        ? [...filterValues.ratings]
        : null;

    showFilters = false;
  }

  function resetFilters() {
    filters.yearRange = null;
    filters.ratings = null;

    filterValues.yearRange = [yearMin, yearMax];
    filterValues.ratings = [];
  }

  function resetSorting() {
    sortMode = defaultSort;
  }

  function clearSearch() {
    searchQuery = '';
  }

  /* -------------------- Return API -------------------- */

  return {
    // state
    showSearch,
    showFilters,
    showSort,

    searchQuery,
    sortMode,

    filterValues,
    filters,

    // derived
    filteredItems,
    isSearching,
    isFiltering,
    isSorting,

    // actions
    toggleSearch,
    toggleFilters,
    toggleSort,

    applyFilters,
    resetFilters,
    resetSorting,
    clearSearch
  };
}
