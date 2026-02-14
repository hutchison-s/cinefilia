<script lang="ts">
  import { goto } from '$app/navigation';
  import MovieCardWithActions from '$lib/components/MovieCardWithActions.svelte';
  import { ArrowDownUp, Search } from 'lucide-svelte';
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();

  type ExploreSortMode = 'popularity' | 'newestYear' | 'oldestYear' | 'titleAZ' | 'titleZA';

  let showSearch = $state(false);
  let showSort = $state(false);
  let searchQuery = $state('');
  let sortMode = $state<ExploreSortMode>('popularity');
  let searchDebounce: ReturnType<typeof setTimeout> | null = null;

  const sortOptions: { label: string; value: ExploreSortMode }[] = [
    { label: 'Popularity', value: 'popularity' },
    { label: 'Newest Year', value: 'newestYear' },
    { label: 'Oldest Year', value: 'oldestYear' },
    { label: 'Title (A-Z)', value: 'titleAZ' },
    { label: 'Title (Z-A)', value: 'titleZA' }
  ];

  $effect(() => {
    data.query;
    data.sortMode;
    searchQuery = data.query ?? '';
    sortMode = data.sortMode;
  });

  function buildUrl({
    page = 1,
    query = searchQuery,
    sort = sortMode
  }: {
    page?: number;
    query?: string;
    sort?: ExploreSortMode;
  }) {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      params.set('query', trimmedQuery);
    }
    params.set('sort', sort);
    params.set('page', String(page));
    return `/explore/${data.type}/${data.specific}?${params.toString()}`;
  }

  function toggleSearch() {
    if (showSearch) {
      searchQuery = '';
      goto(buildUrl({ page: 1, query: '', sort: sortMode }), {
        replaceState: true,
        keepFocus: true,
        noScroll: true
      });
    }
    showSearch = !showSearch;
    showSort = false;
  }

  function toggleSort() {
    showSort = !showSort;
    showSearch = false;
  }

  function applySearch() {
    goto(buildUrl({ page: 1, query: searchQuery, sort: sortMode }), {
      replaceState: true,
      keepFocus: true,
      noScroll: true
    });
  }

  function queueDebouncedSearch() {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const nextQuery = searchQuery.trim();
    const currentQuery = (data.query ?? '').trim();
    if (nextQuery === currentQuery) {
      return;
    }

    searchDebounce = setTimeout(() => {
      applySearch();
      searchDebounce = null;
    }, 300);
  }
</script>

<svelte:head>
  <title>{data.title} - Explore {data.typeTitle} - Cinefilia</title>
</svelte:head>

<div class="fixed top-18 left-0 right-0 bg-gradient-primary backdrop-blur-md z-10 px-4 py-2 flex justify-between items-center">
  <h1 class="text-2xl font-thin uppercase text-white font-semibold">
    {data.title}
  </h1>

  <div class="flex items-center gap-1">
    <button
      class="bg-white/10 text-white p-2 rounded hover:bg-white/20"
      class:bg-gradient-secondary={showSort}
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

{#if showSearch}
  <div class="fixed top-30 left-0 right-0 bg-gradient-primary z-9 px-4 py-3">
    <input
      type="text"
      placeholder={`Search in ${data.title}...`}
      bind:value={searchQuery}
      oninput={queueDebouncedSearch}
      onkeydown={(e) => {
        if (e.key === 'Enter') {
          if (searchDebounce) {
            clearTimeout(searchDebounce);
            searchDebounce = null;
          }
          applySearch();
        }
      }}
      class="w-full p-3 rounded bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-secondary"
    />
  </div>
{/if}

<section
  class="px-4 space-y-4"
  class:mt-38={showSearch}
  class:mt-20={!showSearch}
>
  {#if data.results.length === 0}
    <p class="text-slate-300">No movies found for this selection.</p>
  {:else}
    <div class="grid gap-3">
      {#each data.results as item (item.id)}
        <MovieCardWithActions
          title={item.title}
          poster_path={item.poster_path ?? undefined}
          backdrop_path={item.backdrop_path ?? undefined}
          release_date={item.release_date}
          is_watched={item.is_watched}
          is_watchNext={item.is_watchNext}
          onClick={() => goto(`/movie/${item.id}`)}
        />
      {/each}
    </div>

    <div class="flex items-center justify-between pt-4 pb-6">
      {#if data.hasPrevPage && data.prevPage}
        <a
          href={buildUrl({ page: data.prevPage })}
          class="px-3 py-2 rounded bg-white/10 text-white hover:bg-white/20"
        >
          Previous
        </a>
      {:else}
        <span></span>
      {/if}

      <span class="text-slate-300 text-sm">Page {data.currentPage}</span>

      {#if data.hasNextPage && data.nextPage}
        <a
          href={buildUrl({ page: data.nextPage })}
          class="px-3 py-2 rounded bg-white/10 text-white hover:bg-white/20"
        >
          Next
        </a>
      {/if}
    </div>
  {/if}
</section>

{#if showSort}
  <div
    onclick={() => (showSort = false)}
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
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
              sortMode = option.value as ExploreSortMode;
              showSort = false;
              goto(buildUrl({ page: 1, query: searchQuery, sort: option.value }), {
                replaceState: true,
                keepFocus: true,
                noScroll: true
              });
            }}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}
