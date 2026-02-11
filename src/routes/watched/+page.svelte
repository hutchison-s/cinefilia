<script lang="ts">
  import { goto } from '$app/navigation';
  import MovieCard from '$lib/components/MovieCard.svelte';
  import type { PageData } from './$types';

  const { data } = $props<{
    data: PageData;
  }>();
</script>

<svelte:head>
  <title>Watched List - Cinefilia</title>
</svelte:head>

<div class="w-full max-w-7xl mx-auto ">
  <h1 class="text-3xl font-bold text-white mb-6">Watched Movies</h1>

  {#if data.items.length === 0}
    <div class="text-center text-zinc-400 py-12">
      <p>No movies watched yet. Start exploring!</p>
    </div>
  {:else}
    <div class="grid gap-4 lg:grid-cols-2">
      {#each data.items as item}
        <MovieCard
          title={item.title}
          poster_path={item.posterPath}
          rating={item.rating}
          release_date={item.releaseYear ? `${item.releaseYear}-01-01` : undefined}
          onClick={() => goto(`/movie/${item.id}`)}
        />
      {/each}
    </div>
  {/if}
</div>
