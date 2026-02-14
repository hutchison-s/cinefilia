<script lang="ts">
  import { ArrowDownUp, Search } from 'lucide-svelte';
  import ActorCard from '$lib/components/ActorCard.svelte';
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();

  type ActorSortMode = 'popularity' | 'nameAZ' | 'nameZA' | 'ageOlder' | 'ageYounger';

  let showSearch = $state(false);
  let showSort = $state(false);
  let searchQuery = $state('');
  let sortMode = $state<ActorSortMode>('popularity');

  const sortOptions: { label: string; value: ActorSortMode }[] = [
    { label: 'Popularity', value: 'popularity' },
    { label: 'Name (A-Z)', value: 'nameAZ' },
    { label: 'Name (Z-A)', value: 'nameZA' },
    { label: 'Age (Older)', value: 'ageOlder' },
    { label: 'Age (Younger)', value: 'ageYounger' }
  ];

  let displayedActors = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    let items = [...data.actors];

    if (q) {
      items = items.filter((actor) => actor.name.toLowerCase().includes(q));
    }

    items.sort((a, b) => {
      switch (sortMode) {
        case 'popularity':
          return (b.popularity ?? 0) - (a.popularity ?? 0);
        case 'nameAZ':
          return a.name.localeCompare(b.name);
        case 'nameZA':
          return b.name.localeCompare(a.name);
        case 'ageOlder':
          return (b.age ?? -1) - (a.age ?? -1);
        case 'ageYounger':
          return (a.age ?? 1000) - (b.age ?? 1000);
        default:
          return 0;
      }
    });

    return items;
  });

  function toggleSearch() {
    if (showSearch) {
      searchQuery = '';
    }
    showSearch = !showSearch;
    showSort = false;
  }

  function toggleSort() {
    showSort = !showSort;
    showSearch = false;
  }
</script>

<svelte:head>
  <title>Actors - Explore - Cinefilia</title>
</svelte:head>

<div class="fixed top-18 left-0 right-0 bg-gradient-primary backdrop-blur-md z-10 px-4 py-2 flex justify-between items-center">
  <h1 class="text-2xl font-thin uppercase text-white font-semibold">
    Explore Actors
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
      placeholder="Search actors..."
      bind:value={searchQuery}
      class="w-full p-3 rounded bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-secondary"
    />
  </div>
{/if}

<section
  class="px-4 space-y-3"
  class:mt-38={showSearch}
  class:mt-20={!showSearch}
>
  {#if displayedActors.length === 0}
    <p class="text-slate-300">No actors found.</p>
  {:else}
    {#each displayedActors as actor (actor.id)}
      <ActorCard
        name={actor.name}
        profilePath={actor.profilePath}
        href={actor.href}
      />
    {/each}
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
              sortMode = option.value;
              showSort = false;
            }}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}
