<script lang="ts">
  import { goto } from '$app/navigation';
  import MovieCard from '$lib/components/MovieCard.svelte';
  import type { PageData } from './$types';
  import { ArrowDownUp, Search } from 'lucide-svelte';

  import {
    applyListTransform,
    type SortMode
  } from '$lib/utils/listTransformer';

  const { data } = $props<{ data: PageData }>();

  /* -------------------- UI TOGGLES -------------------- */

  let showSearch = $state(false);
  let showSort = $state(false);

  function toggleSearch() {
    if (showSearch) searchQuery = '';
    showSearch = !showSearch;
    showSort = false;
  }

  function toggleSort() {
    showSort = !showSort;
    showSearch = false;
  }

  /* -------------------- SEARCH -------------------- */

  let searchQuery = $state('');

  let isSearching = $derived(
    searchQuery.trim().length > 0
  );

  /* -------------------- SORT -------------------- */

  let sortMode = $state<SortMode>('recentlyWatched');

  const sortOptions: { label: string; value: SortMode }[] = [
    { label: 'Recently Added', value: 'recentlyWatched' },
    { label: 'Newest Year', value: 'newestYear' },
    { label: 'Oldest Year', value: 'oldestYear' },
    { label: 'Title (A–Z)', value: 'titleAZ' },
    { label: 'Title (Z–A)', value: 'titleZA' }
  ];

  let isSorting = $derived(
    sortMode !== 'recentlyWatched'
  );

  function resetSorting() {
    sortMode = 'recentlyWatched';
  }

  /* -------------------- DERIVED LIST -------------------- */

  let displayedItems = $derived.by(() =>
    applyListTransform(
      data.items,
      {
        yearRange: null,
        ratings: null,
        searchQuery
      },
      sortMode
    )
  );
</script>

<svelte:head>
  <title>Watch Next - Cinefilia</title>
</svelte:head>

<!-- HEADER -->
<div class="fixed top-18 left-0 right-0 bg-gradient-primary backdrop-blur-md z-10 px-4 py-2 flex justify-between items-center">
  <h1 class="text-2xl font-thin uppercase text-white font-semibold">
    Watch Next
  </h1>

  <div class="flex items-center gap-1">
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
      placeholder="Search watch next..."
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
  {#if displayedItems.length === 0}
    <div class="text-center text-zinc-400 py-12">
      <p>No movies in your watch next list. Add some today!</p>
    </div>
  {:else}
    <div class="grid gap-4 lg:grid-cols-2">
      {#each displayedItems as item (item.id)}
        <MovieCard
          title={item.title}
          poster_path={item.posterPath}
          release_date={
            item.releaseYear
              ? `${item.releaseYear}-01-01`
              : undefined
          }
          onClick={() => goto(`/movie/${item.id}`)}
        />
      {/each}
    </div>
  {/if}
</div>

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
