<script lang="ts">
  import { deserialize } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Funnel, ArrowDownUp, Check } from 'lucide-svelte';
  import type { PageData } from './$types';
	import Pill from '$lib/components/Pill.svelte';
	import MovieCardWithActions from '$lib/components/MovieCardWithActions.svelte';
  import InfiniteScrollTrigger from '$lib/components/InfiniteScrollTrigger.svelte';
  import {
    getExplorePageSnapshot,
    setExplorePageSnapshot
  } from '$lib/state/explorePageState';
  import type { TMDBMovieListItem } from '$lib/server/tmdb/controller';

  const { data } = $props();
  type ExploreMovies = PageData['movies'];

  /* ================= URL STATE ================= */

  const url = $derived(page.url);
  const sp = $derived(url.searchParams);

  const currentGenres = $derived(sp.getAll('genre'));
  const currentActor = $derived(sp.get('actor'));
  const currentDecades = $derived(
    sp.getAll('decade').map(d => Number(d))
  );
  const currentSort = $derived(
    sp.get('sort') ?? 'popularity.desc'
  );
  const includeFutureReleaseDates = $derived(
    sp.get('includeFutureReleaseDates') === 'true'
  );
  const snapshotKey = $derived(`${url.pathname}?${sp.toString()}`);

  /* ================= MODAL STATE ================= */

  let showFilter = $state(false);
  let showSort = $state(false);

  /* ================= DRAFT STATE ================= */

  let draftGenres = $state<string[]>([]);
  let draftDecades = $state<number[]>([]);
  let draftActor = $state<string | null>(null);
  let draftIncludeFutureReleaseDates = $state(false);

  let actorQuery = $state('');
  let actorResults = $state<{ id: number; name: string }[]>([]);
  let actorSearchTimeout: ReturnType<typeof setTimeout> | null = null;
  let visibleMovies = $state<TMDBMovieListItem[]>([]);
  let nextPage = $state(2);
  let totalPages = $state(1);
  let isLoadingMore = $state(false);
  let pageTitle = $derived(
    data.actorName ? `${data.actorName} Movies - Cinefilia` : 'Explore Movies - Cinefilia'
  );

  /* Sync draft when modal opens */
  $effect(() => {
    if (showFilter) {
      draftGenres = [...currentGenres];
      draftDecades = [...currentDecades];
      draftActor = currentActor;
      draftIncludeFutureReleaseDates = includeFutureReleaseDates;
      actorQuery = '';
      actorResults = [];
    }
  });

  /* ================= GENRE DRAFT ================= */

  function toggleDraftGenre(id: number) {
    const key = id.toString();

    if (draftGenres.includes(key)) {
      draftGenres = draftGenres.filter(g => g !== key);
    } else {
      draftGenres = [...draftGenres, key];
    }
  }

  /* ================= DECADE DRAFT (RANGE) ================= */

  const decades = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

  function toggleDraftDecade(decade: number) {
    if (draftDecades.length === 0) {
      draftDecades = [decade];
      return;
    }

    if (draftDecades.length === 1) {
      if (draftDecades[0] === decade) {
        draftDecades = [];
        return;
      }

      const min = Math.min(draftDecades[0], decade);
      const max = Math.max(draftDecades[0], decade);
      draftDecades = [min, max];
      return;
    }

    // already a range → start new range
    draftDecades = [decade];
  }

  function isDecadeSelected(decade: number) {
    if (draftDecades.length === 1) {
      return draftDecades[0] === decade;
    }

    if (draftDecades.length === 2) {
      const [min, max] = draftDecades;
      return decade >= min && decade <= max;
    }

    return false;
  }

  function isBoundary(decade: number) {
    return draftDecades.includes(decade);
  }

  /* ================= ACTOR SEARCH ================= */

  function debounceSearch(q: string) {
    if (actorSearchTimeout) clearTimeout(actorSearchTimeout);

    actorSearchTimeout = setTimeout(async () => {
      const res = await fetch('/api/search/actor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q })
    });

    const json = await res.json();
    actorResults = json.actors;
    }, 300);
  }

  $effect(() => {
    if (actorQuery.trim().length >= 2 && !draftActor) {
      debounceSearch(actorQuery);
    } else {
      actorResults = [];
    }
  });

  function selectActorFromDropdown(actor: { id: number; name: string }) {
    draftActor = actor.id.toString();
    actorQuery = actor.name;      // fill input
    actorResults = [];            // close dropdown
  }

  /* ================= APPLY FILTERS ================= */

  function applyFilters() {
    const params = new URLSearchParams(sp);

    params.delete('genre');
    draftGenres.forEach(g => params.append('genre', g));

    params.delete('decade');
    draftDecades.forEach(d =>
      params.append('decade', d.toString())
    );

    if (draftActor) {
      params.set('actor', draftActor);
    } else {
      params.delete('actor');
    }

    if (draftIncludeFutureReleaseDates) {
      params.set('includeFutureReleaseDates', 'true');
    } else {
      params.delete('includeFutureReleaseDates');
    }

    params.set('page', '1');

    goto(`?${params.toString()}`);
    showFilter = false;
  }

  function clearFilters() {
    const params = new URLSearchParams();
    params.set('page', '1');
    if (currentSort) {
      params.set('sort', currentSort)
    }
    goto(`?${params.toString()}`)
    showFilter = false;
  }

  let isFiltering = $derived(
    currentGenres.length || currentDecades.length || currentActor || includeFutureReleaseDates
  )

  /* ================= SORT ================= */

  const sortOptions = [
    { label: 'Popularity', value: 'popularity.desc' },
    { label: 'Newest', value: 'primary_release_date.desc' },
    { label: 'Oldest', value: 'primary_release_date.asc' },
    { label: 'Title A–Z', value: 'original_title.asc' },
    { label: 'Title Z–A', value: 'original_title.desc' }
  ];

  function setSort(value: string) {
    const params = new URLSearchParams(sp);
    params.set('sort', value);
    params.set('page', '1');
    goto(`?${params.toString()}`);
    showSort = false;
  }
  function removeParam(key: string, value?: string) {
    const params = new URLSearchParams(sp);

    if (value) {
      const filtered = params.getAll(key).filter(v => v !== value);
      params.delete(key);
      filtered.forEach(v => params.append(key, v));
    } else {
      params.delete(key);
    }

    params.set('page', '1');
    goto(`?${params.toString()}`);
  }

  let isSorting = $derived(currentSort !== 'popularity.desc')

  let currentDecadeDisplay = $derived.by(()=>{
    if (!currentDecades.length) return '';
    if (currentDecades.length === 1) return currentDecades[0]+'s'
    const sorted = [...currentDecades].sort()
    return `${sorted[0]}s - ${sorted[sorted.length - 1]}s`
  });

  const watchedIds = $derived(new Set((data.watched ?? []).map((m) => m.mediaId)));
  const watchNextIds = $derived(new Set((data.watchNext ?? []).map((m) => m.mediaId)));
  const hasMoreMovies = $derived(nextPage <= totalPages);

  function persistExploreSnapshot() {
    setExplorePageSnapshot(snapshotKey, {
      visibleMovies,
      nextPage,
      totalPages
    });
  }

  $effect(() => {
    const cachedSnapshot = getExplorePageSnapshot(snapshotKey);

    if (cachedSnapshot) {
      visibleMovies = cachedSnapshot.visibleMovies;
      nextPage = cachedSnapshot.nextPage;
      totalPages = cachedSnapshot.totalPages;
      isLoadingMore = false;
      return;
    }

    visibleMovies = data.movies.results;
    nextPage = data.movies.page + 1;
    totalPages = data.movies.total_pages;
    isLoadingMore = false;
    persistExploreSnapshot();
  });

  async function loadMoreMovies() {
    if (isLoadingMore || !hasMoreMovies) {
      return;
    }

    isLoadingMore = true;

    try {
      const formData = new FormData();
      formData.set('nextPage', String(nextPage));

      const res = await fetch(`${url.pathname}?/loadMore&${sp.toString()}`, {
        method: 'POST',
        body: formData
      });

      const result = deserialize(await res.text());

      if (result.type !== 'success') {
        throw new Error('Failed to load more movies');
      }

      const movies = (result.data as { movies?: ExploreMovies } | undefined)?.movies;

      if (!movies) {
        return;
      }

      visibleMovies = [...visibleMovies, ...movies.results];
      totalPages = movies.total_pages;
      nextPage = movies.page + 1;
      persistExploreSnapshot();
    } catch (error) {
      console.error(error);
    } finally {
      isLoadingMore = false;
    }
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<!-- HEADER -->
<div class="fixed top-18 h-13 left-0 right-0 bg-gradient-primary backdrop-blur-md z-10 px-4 py-2 flex justify-between items-center">
  <h1 class="text-2xl font-thin uppercase text-white">Explore</h1>

  <div class="flex gap-2">
    <button
      class="bg-white/10 text-white p-2 rounded hover:bg-white/20"
      class:bg-gradient-secondary={isFiltering}
      onclick={()=>showFilter = true}
    >
      <Funnel size="20" />
    </button>

    <button
      class="bg-white/10 text-white p-2 rounded hover:bg-white/20"
      class:bg-gradient-secondary={isSorting}
      onclick={()=>showSort = true}
    >
      <ArrowDownUp size="20" />
    </button>
  </div>
</div>
  <!--Active filters-->
  {#if isFiltering}
<div class="fixed top-31 z-5 flex w-full items-center gap-1 bg-black/50 px-1.5 py-2.5 backdrop-blur-md">

  <!-- GENRES -->
  {#each currentGenres as g}
    {@const gLabel = data.genres?.find(genre => genre.id == Number(g))?.name}
    {#if gLabel}
      <Pill
        theme="secondary"
        size="md"
        label={gLabel}
        onclick={() => removeParam('genre', g)}
      />
    {/if}
  {/each}

  <!-- DECADE RANGE -->
  {#if currentDecades.length}
    {@const sorted = [...currentDecades].sort((a,b)=>a-b)}
    <Pill
      theme="secondary"
      size="md"
      label={currentDecadeDisplay}
      onclick={() => removeParam('decade')}
    />
  {/if}

  <!-- ACTOR -->
  {#if currentActor}
    <Pill
      theme="secondary"
      size='md'
      label={data.actorName ?? ''}
      onclick={() => removeParam('actor')}
    />
  {/if}

  {#if includeFutureReleaseDates}
    <Pill
      theme="secondary"
      size="md"
      label="Future releases"
      onclick={() => removeParam('includeFutureReleaseDates')}
    />
  {/if}

</div>
{/if}


<!-- MOVIES -->
<div class="mt-24 px-4 grid gap-4 lg:grid-cols-2" class:mt-32={isFiltering}>
  {#each visibleMovies as movie (movie.id)}
    <MovieCardWithActions
      title={movie.title}
      poster_path={movie.poster_path ?? undefined}
      release_date={movie.release_date}
      is_watched={watchedIds.has(movie.id.toString())}
      is_watchNext={watchNextIds.has(movie.id.toString())}
      connectionCount={data.connectionCounts?.[movie.id.toString()] ?? 0}
      onClick={() => goto(`/movie/${movie.id}`)}
    />
  {/each}
</div>

{#if hasMoreMovies}
  <div class="px-4 py-6">
    <InfiniteScrollTrigger disabled={isLoadingMore} onEnter={loadMoreMovies} />
    {#if isLoadingMore}
      <p class="text-center text-sm text-gray-400">Loading more movies...</p>
    {/if}
  </div>
{/if}

<!-- FILTER MODAL -->
{#if showFilter}
<div
  class="fixed inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
  onclick={() => showFilter = false}
>
  <div
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 w-7/8 max-w-lg rounded-t-2xl sm:rounded-xl p-6 max-h-[90vh] overflow-y-visible"
    onclick={(e) => e.stopPropagation()}
  >
    <h2 class="text-white text-lg mb-6">Filters</h2>

    <!-- GENRES -->
    <div class="mb-6">
      <h3 class="text-gray-400 text-sm mb-2">Genres</h3>
      <div class="w-full overflow-x-auto mask-x-[20px]">
        <div class="flex flex-wrap gap-2 w-[250%]">
          {#each data.genres as genre}
            <button
              class={
                draftGenres.includes(genre.id.toString())
                  ? "px-3 py-1 rounded-full text-sm bg-primary text-white"
                  : "px-3 py-1 rounded-full text-sm bg-primary/25 text-gray-400"
              }
              onclick={() => toggleDraftGenre(genre.id)}
            >
              {genre.name}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- DECADES -->
    <div class="mb-6">
      <h3 class="text-gray-400 text-sm mb-2">Decade</h3>
      <div class="flex flex-wrap gap-2">
        {#each decades as d}
          <button
            class={
              isDecadeSelected(d)
                ? "px-3 py-1 rounded-full text-sm bg-primary text-white"
                : "px-3 py-1 rounded-full text-sm bg-primary/25 text-gray-400"
            }
            class:ring-2={isBoundary(d)}
            class:ring-white={isBoundary(d)}
            onclick={() => toggleDraftDecade(d)}
          >
            {d}s
          </button>
        {/each}
      </div>
    </div>

    <div class="mb-6">
      <label class="flex items-center gap-4 py-1 text-sm text-gray-400">
        
        <span class="relative flex h-5 w-5 items-center justify-center">
          <input
            type="checkbox"
            bind:checked={draftIncludeFutureReleaseDates}
            class="absolute inset-0 cursor-pointer opacity-0"
          />
          <span
            class="flex h-5 w-5 items-center justify-center rounded-md border transition-colors"
            class:border-primary={draftIncludeFutureReleaseDates}
            class:bg-primary={draftIncludeFutureReleaseDates}
            class:border-slate-500={!draftIncludeFutureReleaseDates}
            aria-hidden="true"
          >
            {#if draftIncludeFutureReleaseDates}
              <Check size={14} class="text-white" />
            {/if}
          </span>
        </span>
        <span>Include future release dates</span>
      </label>
    </div>

   <!-- ACTOR -->
<div class="mb-20 relative">
  <h3 class="text-gray-400 text-sm mb-2">Actor</h3>

  <input
    type="text"
    placeholder="Search actor..."
    bind:value={actorQuery}
    class="w-full p-2 rounded bg-gray-800 text-white"
  />

  {#if actorResults.length > 0}
    <div
      class="absolute left-0 right-0 mt-1 bg-black/90 border border-gray-700 rounded shadow-lg z-50 max-h-56 overflow-y-auto"
    >
      {#each actorResults as actor}
        <button
          class="w-full text-left px-3 py-2 hover:bg-gray-700 text-gray-200"
          onclick={() => selectActorFromDropdown(actor)}
        >
          {actor.name}
        </button>
      {/each}
    </div>
  {/if}
</div>

    <!-- ACTIONS -->
    <div class="flex justify-between mt-6">
      <button
        class="text-gray-400"
        onclick={() => showFilter = false}
      >
        Cancel
      </button>

      <button
      class="px-4 py-2 text-gray-200"
      onclick={clearFilters}>
        Clear
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
  class="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  onclick={() => showSort = false}
>
  <div
    class="bg-gray-900 rounded-xl p-6 w-full max-w-md"
    onclick={(e) => e.stopPropagation()}
  >
    <h2 class="text-white mb-4">Sort</h2>

    <div class="flex flex-col gap-2">
      {#each sortOptions as option}
        <button
          class={
            currentSort === option.value
              ? "text-left px-3 py-2 rounded bg-primary text-white"
              : "text-left px-3 py-2 rounded bg-primary/25 text-gray-400"
          }
          onclick={() => setSort(option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>
</div>
{/if}
