<script lang="ts">
  import { goto } from '$app/navigation';
  import MovieCard from '$lib/components/MovieCard.svelte';
  import { ArrowDownUp, Funnel, Search } from 'lucide-svelte';
  import type { PageData } from './$types';
  import StarDisplay from '$lib/components/StarDisplay.svelte';

  import {
    applyListTransform,
    type SortMode
  } from '$lib/utils/listTransformer';

  const { data } = $props<{ data: PageData }>();

  /* -------------------- UI TOGGLES -------------------- */

  let showSearch = $state(false);
  let showFilters = $state(false);
  let showSort = $state(false);

  function toggleSearch() {
    if (showSearch) searchQuery = '';
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

  /* -------------------- SEARCH -------------------- */

  let searchQuery = $state('');

  let isSearching = $derived(
    searchQuery.trim().length > 0
  );

  /* -------------------- SORT -------------------- */

  let sortMode = $state<SortMode>('recentlyWatched');

  const sortOptions: { label: string; value: SortMode }[] = [
    { label: 'Recently Watched', value: 'recentlyWatched' },
    { label: 'Newest Year', value: 'newestYear' },
    { label: 'Oldest Year', value: 'oldestYear' },
    { label: 'Highest Rated', value: 'highestRated' },
    { label: 'Lowest Rated', value: 'lowestRated' },
    { label: 'Title (A–Z)', value: 'titleAZ' },
    { label: 'Title (Z–A)', value: 'titleZA' }
  ];

  let isSorting = $derived(
    sortMode !== 'recentlyWatched'
  );

  function resetSorting() {
    sortMode = 'recentlyWatched';
  }

  /* -------------------- FILTERS -------------------- */

  const yearMin = 1900;
  const yearMax = new Date().getFullYear();

  let filterValues = $state({
    yearRange: [yearMin, yearMax] as [number, number],
    ratings: [] as number[]
  });

  let filters = $state<{
    yearRange: [number, number] | null;
    ratings: number[] | null;
  }>({
    yearRange: null,
    ratings: null
  });

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

  /* -------------------- DERIVED LIST -------------------- */

  let filteredItems = $derived.by(() =>
    applyListTransform(
      data.items,
      {
        yearRange: filters.yearRange,
        ratings: filters.ratings,
        searchQuery
      },
      sortMode
    )
  );
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
      onclick={toggleFilters}
    >
      <Funnel size="20" />
    </button>

    <button
      class="bg-white/10 text-white p-2 rounded hover:bg-white/20"
      class:bg-gradient-secondary={isSorting}
      onclick={toggleSort}
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

<!-- SEARCH -->
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
  class:mt-38={showSearch}
  class:mt-20={!showSearch}
>
  {#if data.items.length === 0}
    <div class="text-center text-zinc-400 py-12">
      <p>No movies watched yet. Start exploring!</p>
    </div>
  {:else}
    <div class="grid gap-4 lg:grid-cols-2">
      {#each filteredItems as item (item.id)}
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
{#if showFilters}
  <div
    onclick={() => (showFilters = false)}
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
    >
      <h2 class="text-xl font-semibold text-white mb-4">
        Filter Options
      </h2>

      <!-- Year -->
      <div class="mb-4">
        <label class="block text-sm text-gray-400 mb-2">
          Release Year
        </label>

        <div class="flex gap-2 items-center">
          <input
            type="number"
            bind:value={filterValues.yearRange[0]}
            class="w-full p-2 rounded bg-gray-700 text-white"
          />
          <span class="text-gray-400">to</span>
          <input
            type="number"
            bind:value={filterValues.yearRange[1]}
            class="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
      </div>

      <!-- Ratings -->
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
                checked={filterValues.ratings.includes(rating)}
                onchange={(e) => {
                  if ((e.target as HTMLInputElement).checked) {
                    filterValues.ratings = [
                      ...filterValues.ratings,
                      rating
                    ];
                  } else {
                    filterValues.ratings =
                      filterValues.ratings.filter(r => r !== rating);
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
          class="bg-gray-600 text-white px-4 py-2 rounded"
          onclick={resetFilters}
          disabled={!isFiltering}
        >
          Reset
        </button>

        <button
          class="bg-primary text-white px-4 py-2 rounded"
          onclick={applyFilters}
        >
          Apply
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- SORT MODAL -->
{#if showSort}
  <div
    onclick={() => (showSort = false)}
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
        {#each sortOptions as option}
          <button
            class="text-left px-3 py-2 rounded transition"
            class:bg-primary={sortMode === option.value}
            class:text-white={sortMode === option.value}
            class:bg-gray-700={sortMode !== option.value}
            class:text-gray-400={sortMode !== option.value}
            onclick={() => {
              sortMode = option.value;
              showSort = false;
            }}
          >
            {option.label}
          </button>
        {/each}
      </div>

      <button
        class="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
        onclick={resetSorting}
        disabled={!isSorting}
      >
        Reset
      </button>
    </div>
  </div>
{/if}
