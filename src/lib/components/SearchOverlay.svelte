<script lang="ts">
	import { goto } from '$app/navigation';
  import SearchBar from '$lib/components/SearchBar.svelte';
	import MovieCardWithActions from './MovieCardWithActions.svelte';

  const props = $props<{
    watchedIds: string[];
    watchNextIds: string[];
    onClose: () => void;
  }>();

  let results = $state<any[]>([]);
  let resultsContainer: HTMLDivElement;

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      props.onClose();
    }
  }

  $effect(()=> {
    if (results.length > 0) {
      console.log($state.snapshot(results).slice(0, 1));
      console.log(props.watchedIds)
    }
  })

  $effect(() => {
    results;
    if (resultsContainer) {
      resultsContainer.scrollTop = 0;
    }
  });

  $effect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-start justify-center py-12 pt-18"
  aria-hidden="true"
  onclick={props.onClose}
>

<!-- Dialog wrapper -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="search-title"
    tabindex="-1"
    class="w-7/8 max-w-3xl bg-zinc-900 rounded-xl shadow-xl p-6 outline-none"
    onkeydown={onKeydown}
    onclick={(e) => e.stopPropagation()}
  >
    <h2 id="search-title" class="sr-only">
      Search
    </h2>

    <!-- Search input -->
    <SearchBar
      placeholder="Search movies…"
      type="movie"
      onResults={(e) => (results = e.results)}
      onClear={() => (results = [])}
    />

    <!-- Results -->
    <div bind:this={resultsContainer} class="mt-6 max-h-[60vh] overflow-y-auto grid gap-2">
      {#if results.length === 0}
        <p class="text-zinc-400 text-sm">Start typing to search</p>
      {/if}

      {#each results as item (item.id)}
       <MovieCardWithActions
          title={item.title}
          poster_path={item.poster_path}
          backdrop_path={item.backdrop_path}
          release_date={item.release_date}
          is_watched={props.watchedIds.includes(String(item.id))}
          is_watchNext={props.watchNextIds.includes(String(item.id))}
          onClick={()=>{
            goto(`/movie/${item.id}`);
            props.onClose();
          }}
        />
      {/each}
    </div>
  </div>

</div>
