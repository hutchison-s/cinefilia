<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import MovieCard from '$lib/components/MovieCard.svelte';
  import { Funnel, ArrowDownUp } from 'lucide-svelte';
  import type { PageData } from './$types';
	import Pill from '$lib/components/Pill.svelte';

  const { data } = $props();

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

  /* ================= MODAL STATE ================= */

  let showFilter = $state(false);
  let showSort = $state(false);

  /* ================= DRAFT STATE ================= */

  let draftGenres = $state<string[]>([]);
  let draftDecades = $state<number[]>([]);
  let draftActor = $state<string | null>(null);

  let actorQuery = $state('');
  let actorResults = $state<{ id: number; name: string }[]>([]);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  /* Sync draft when modal opens */
  $effect(() => {
    if (showFilter) {
      draftGenres = [...currentGenres];
      draftDecades = [...currentDecades];
      draftActor = currentActor;
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

  const decades = [1960, 1970, 1980, 1990, 2000, 2010, 2020];

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
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(async () => {
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

  $inspect('actorResults updated', actorResults)

  $effect(() => {
    if (actorQuery.trim().length >= 2) {
      debounceSearch(actorQuery);
    } else {
      actorResults = [];
    }
  });

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

    params.set('page', '1');

    goto(`?${params.toString()}`);
    showFilter = false;
  }

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
</script>

<!-- HEADER -->
<div class="fixed top-18 left-0 right-0 bg-gradient-primary backdrop-blur-md z-10 px-4 py-2 flex justify-between items-center">
  <h1 class="text-2xl font-thin uppercase text-white">Explore</h1>

  <div class="flex gap-2">
    <button class="text-white p-2" onclick={() => showFilter = true}>
      <Funnel size="22" />
    </button>

    <button class="text-white p-2" onclick={() => showSort = true}>
      <ArrowDownUp size="22" />
    </button>
  </div>
  
</div>
<div class="items-center flex gap-1 mt-18">
  {#each currentGenres as g}
  {@const gLabel = data.genres?.find(genre => genre.id == Number(g))?.name}
  {#if gLabel}
    <Pill theme='primary' label={gLabel}/>
    {/if}
  {/each}
  {#if currentDecades.length}
    {@const sorted = currentDecades.sort()}
    <Pill theme='primary' label={sorted[0]+'s - '+sorted[sorted.length - 1]+'s'} />
  {/if}
  {#if currentActor}
    <Pill theme='primary' label={'actor'+currentActor}/>
  {/if}
</div>


<!-- MOVIES -->
<div class="mt-4 px-4 grid gap-4 lg:grid-cols-2">
  {#each data.movies.results as movie (movie.id)}
    <MovieCard
      title={movie.title}
      poster_path={movie.poster_path ?? undefined}
      release_date={movie.release_date}
      onClick={() => goto(`/movie/${movie.id}`)}
    />
  {/each}
</div>

<!-- FILTER MODAL -->
{#if showFilter}
<div
  class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
  onclick={() => showFilter = false}
>
  <div
    class="bg-gray-900 w-full max-w-lg rounded-t-2xl sm:rounded-xl p-6 max-h-[90vh] overflow-y-auto"
    onclick={(e) => e.stopPropagation()}
  >
    <h2 class="text-white text-lg mb-6">Filters</h2>

    <!-- GENRES -->
    <div class="mb-6">
      <h3 class="text-gray-400 text-sm mb-2">Genres</h3>
      <div class="flex flex-wrap gap-2">
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

    <!-- ACTOR -->
    <div class="mb-6">
      <h3 class="text-gray-400 text-sm mb-2">Actor</h3>

      <input
        type="text"
        placeholder="Search actor..."
        bind:value={actorQuery}
        class="w-full p-2 rounded bg-gray-800 text-white"
      />

      <div class="mt-2 space-y-2 max-h-40 overflow-y-auto">
        {#each actorResults as actor}
          <button
            class={
              draftActor === actor.id.toString()
                ? "w-full text-left p-2 bg-primary text-white rounded"
                : "w-full text-left p-2 bg-black/75 text-gray-200 rounded hover:bg-gray-700"
            }
            onclick={() => draftActor = actor.id.toString()}
          >
            {actor.name}
          </button>
        {/each}
      </div>
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
  class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
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