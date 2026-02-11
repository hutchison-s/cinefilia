<script lang="ts">
  import { goto } from '$app/navigation';
  import MovieCard from '$lib/components/MovieCard.svelte';
  import { ArrowDownUp, Funnel, Search } from 'lucide-svelte';
  import type { PageData } from './$types';
	import StarDisplay from '$lib/components/StarDisplay.svelte';

  const { data } = $props<{
    data: PageData;
  }>();

  /* -------------------- SORT STATE -------------------- */

  type SortMode =
  | 'newestYear'
  | 'oldestYear'
  | 'recentlyWatched'
  | 'highestRated'
  | 'lowestRated'
  | 'titleAZ'
  | 'titleZA';

let sortMode = $state<SortMode>('recentlyWatched');

let showSortOptions = $state(false);

const toggleShowSortOptions = () => {
  showSortOptions = !showSortOptions;
  showFilterOptions = false;
};

const handleResetSorting = () => {
  sortMode = 'recentlyWatched';
};

  let isSorting = $derived(
    sortMode !== 'recentlyWatched'
  );

  /* -------------------- SEARCH STATE -------------------- */

let showSearch = $state(false);
let searchQuery = $state('');

const toggleSearch = () => {
  if (showSearch) {
    searchQuery = '';
  }
  showSearch = !showSearch;
  showFilterOptions = false;
  showSortOptions = false;
};


  /* -------------------- FILTER STATE -------------------- */

let filterOption = $state<{
  yearRange: number[] | null;
  ratings: number[] | null;
}>({
  yearRange: null,
  ratings: null
});

let filterValues = $state({
  yearRange: [
    1900,
    new Date().getFullYear()
  ],
  ratings: [] as number[]
});


let filterValueOptions = {
  yearRange: { min: 1900, max: new Date().getFullYear() },
  ratings: { min: 0, max: 5 }
};

let showFilterOptions = $state(false);

const toggleShowFilterOptions = () => {
  showFilterOptions = !showFilterOptions;
  showSortOptions = false;
};

const handleApplyFilters = (e: MouseEvent) => {
  e.stopPropagation();
  showFilterOptions = false;

  filterOption.yearRange = [...filterValues.yearRange];
  filterOption.ratings =
    filterValues.ratings.length > 0
      ? [...filterValues.ratings]
      : null;
};

const handleResetFilters = () => {
  filterOption.yearRange = null;
  filterOption.ratings = null;

  filterValues.yearRange = [
    1900,
    new Date().getFullYear()
  ];

  filterValues.ratings = [];
};


let isFiltering = $derived.by(() => {
  const yearMin = filterValueOptions.yearRange.min;
  const yearMax = filterValueOptions.yearRange.max;

  const yearActive =
    filterOption.yearRange !== null &&
    (
      filterOption.yearRange[0] !== yearMin ||
      filterOption.yearRange[1] !== yearMax
    );

  const ratingActive =
    filterOption.ratings !== null &&
    filterOption.ratings.length > 0;

  return yearActive || ratingActive;
});




  /* -------------------- DERIVED LIST -------------------- */

  let filteredAndSortedItems = $derived.by(() => {
    let items = [...data.items];

    /* ---------- Filtering ---------- */


if (searchQuery.trim()) {
  const q = searchQuery.toLowerCase();

  items = items.filter((item) =>
    item.title?.toLowerCase().includes(q)
  );
}


    if (filterOption.yearRange) {
  const [min, max] = filterOption.yearRange;

  items = items.filter((item) =>
    item.releaseYear != null &&
    item.releaseYear >= min &&
    item.releaseYear <= max
  );
}


    if (filterOption.ratings?.length) {
  items = items.filter((item) => {
    if (!item.rating) return false;

    const floored = Math.floor(item.rating);
    return filterOption.ratings!.includes(floored);
  });
}


    /* ---------- Sorting ---------- */

    items.sort((a, b) => {
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


    return items;
  });

$inspect(filteredAndSortedItems.slice(0, 2))

</script>

<svelte:head>
  <title>Watched List - Cinefilia</title>
</svelte:head>

<!-- HEADER -->
<div class="fixed top-18 left-0 right-0 bg-gradient-primary backdrop-blur-md z-10 px-4 py-2 flex justify-between items-center">
  <h1 class="text-2xl font-thin uppercase text-white font-semibold">
    Watched List
  </h1>

  <div class="flex items-center gap-1">
    <button
  class="bg-white/10 text-white p-2 rounded hover:bg-white/20"
  class:bg-gradient-secondary={isFiltering}
  onclick={toggleShowFilterOptions}
>
  <Funnel size="20" />
</button>

<button
  class="bg-white/10 text-white p-2 rounded hover:bg-white/20"
  class:bg-gradient-secondary={isSorting}
  onclick={toggleShowSortOptions}
>
  <ArrowDownUp size="20" />
</button>

<button
  class="bg-white/10 text-white p-2 rounded hover:bg-white/20"
  class:bg-gradient-secondary={showSearch}
  onclick={toggleSearch}
>
  <Search size="20" />
</button>

  </div>
</div>
{#if showSearch}
  <div class="fixed top-30 left-0 right-0 bg-gradient-primary z-9 px-4 py-3">
    <input
      type="text"
      placeholder="Search watched movies..."
      bind:value={searchQuery}
      class="w-full p-3 rounded bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-secondary"
    />
  </div>
{/if}


<!-- LIST -->
<div
  class="w-full max-w-7xl mx-auto relative"
  class:mt-32={showSearch}
  class:mt-16={!showSearch}
>

  {#if data.items.length === 0}
    <div class="text-center text-zinc-400 py-12">
      <p>No movies watched yet. Start exploring!</p>
    </div>
  {:else}
    <div class="grid gap-4 lg:grid-cols-2">
      {#each filteredAndSortedItems as item (item.id)}
        <MovieCard
          title={item.title}
          poster_path={item.posterPath}
          rating={item.rating}
          release_date={
            item.releaseYear ? `${item.releaseYear}-06-01` : undefined
          }
          releaseYear={item.releaseYear}
          onClick={() => goto(`/movie/${item.id}`)}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- FILTER MODAL -->
{#if showFilterOptions}
  <div
    onclick={() => (showFilterOptions = false)}
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
    >
      <h2 class="text-xl font-semibold text-white mb-4">
        Filter Options
      </h2>

<!-- Year Range -->
<div class="mb-4">
  <label class="block text-sm text-gray-400 mb-2">
    Release Year
  </label>

  <div class="flex gap-2 items-center">
    <input
      type="number"
      bind:value={filterValues.yearRange[0]}
      min={filterValueOptions.yearRange.min}
      max={filterValueOptions.yearRange.max}
      class="w-full p-2 rounded bg-gray-700 text-white"
    />
    <span class="text-gray-400">to</span>
    <input
      type="number"
      bind:value={filterValues.yearRange[1]}
      min={filterValueOptions.yearRange.min}
      max={filterValueOptions.yearRange.max}
      class="w-full p-2 rounded bg-gray-700 text-white"
    />
  </div>
</div>

<!-- Rating Range -->

  <div class="mb-4">
  <label class="block text-sm text-gray-400 mb-2">
    Ratings
  </label>

  <div class="flex flex-col gap-2">
    {#each [5, 4, 3, 2, 1] as rating}
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          class="accent-secondary"
          value={rating}
          checked={filterValues.ratings.includes(rating)}
          onchange={(e) => {
            if ((e.target as HTMLInputElement).checked) {
              filterValues.ratings = [
                ...filterValues.ratings,
                rating
              ];
            } else {
              filterValues.ratings =
                filterValues.ratings.filter((r) => r !== rating);
            }
          }}
        />

        <StarDisplay rating={rating} size="md" />
      </label>
    {/each}
  </div>
</div>


<div class="flex justify-between gap-2 mt-4">
  <button
    class="bg-gray-600 text-white px-4 py-2 rounded disabled:bg-gray-700 disabled:opacity-50"
    onclick={handleResetFilters}
    disabled={
      !isFiltering
    }
  >
    Reset
  </button>

  <button
    class="bg-primary text-white px-4 py-2 rounded"
    onclick={handleApplyFilters}
  >
    Apply
  </button>
</div>
</div>
</div>


{/if}

<!-- SORT MODAL -->
{#if showSortOptions}
  <div
    onclick={() => (showSortOptions = false)}
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div
      class="bg-gray-800 rounded-lg p-4 w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
    >
      <h2 class="text-xl font-semibold text-white mb-4">
  Sort By
</h2>

<div class="grid grid-cols-2 gap-1">
  {#each [
    { label: 'Recently Watched', value: 'recentlyWatched' },
    { label: 'Newest Year', value: 'newestYear' },
    { label: 'Oldest Year', value: 'oldestYear' },
    { label: 'Highest Rated', value: 'highestRated' },
    { label: 'Lowest Rated', value: 'lowestRated' },
    { label: 'Title (A–Z)', value: 'titleAZ' },
    { label: 'Title (Z–A)', value: 'titleZA' }
  ] as option}
    <button
      class="text-left px-3 py-2 rounded transition"
      class:bg-primary={sortMode === option.value}
      class:text-white={sortMode === option.value}
      class:bg-gray-700={sortMode !== option.value}
      class:text-gray-400={sortMode !== option.value}
      onclick={() => {
        sortMode = option.value as SortMode;
        showSortOptions = false;
      }}
    >
      {option.label}
    </button>
  {/each}
</div>

<button
  class="mt-4 bg-gray-600 text-white px-4 py-2 rounded disabled:bg-gray-700 disabled:opacity-50"
  onclick={handleResetSorting}
  disabled={
    !isSorting
  }
>
  Reset
</button>

    </div>
  </div>
{/if}
