<script lang="ts">
  import { goto } from '$app/navigation';
  import MovieCard from '$lib/components/MovieCard.svelte';
  import type { PageData } from './$types';

  const { data } = $props<{
    data: PageData;
  }>();
</script>

<svelte:head>
  <title>Watch Next List - Cinefilia</title>
</svelte:head>

<div class="w-full max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-6">Watch Next</h1>
  

  {#if data.items.length === 0}
    <div class="text-center text-zinc-400 py-12">
      <p>No movies in your watch next list. Add some today!</p>
    </div>
  {:else}
    <div class="grid gap-4 lg:grid-cols-2">
      {#each data.items as item}
        <MovieCard
          title={item.title}
          poster_path={item.posterPath}
          release_date={item.releaseYear ? `${item.releaseYear}-01-01` : undefined}
          onClick={() => goto(`/movie/${item.id}`)}
        />
      {/each}
    </div>
  {/if}
</div>
