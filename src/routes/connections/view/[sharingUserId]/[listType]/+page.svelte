<script lang="ts">
  import { goto } from '$app/navigation';
  import MovieCard from '$lib/components/MovieCard.svelte';
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();

</script>

<svelte:head>
  <title>{data.owner.name}&apos;s {data.listType === 'watched' ? 'Watched' : 'Watch Next'} - Cinefilia</title>
</svelte:head>

<section class="mx-auto w-full max-w-6xl px-4 py-6">
  <div class="rounded-xl border border-slate-800 bg-black/35 p-5">
    <h1 class="text-2xl font-semibold text-white">{data.owner.name}&apos;s {data.listType === 'watched' ? 'Watched' : 'Watch Next'}</h1>
    <p class="mt-2 text-sm text-slate-400">{data.owner.email}</p>
  </div>

  {#if data.items.length === 0}
    <div class="py-12 text-center text-zinc-400">
      <p>This shared list is empty right now.</p>
    </div>
  {:else}
    <div class="mt-6 grid gap-4 lg:grid-cols-2">
      {#each data.items as item (item.id)}
        <MovieCard
          title={item.title}
          poster_path={item.posterPath}
          rating={item.rating}
          release_date={item.releaseYear ? `${item.releaseYear}-01-01` : undefined}
          releaseYear={item.releaseYear}
          onClick={() => goto(`/movie/${item.id}`)}
        />
      {/each}
    </div>
  {/if}
</section>
