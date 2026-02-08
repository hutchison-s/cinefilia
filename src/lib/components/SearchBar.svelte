<script lang="ts">
  const props = $props<{
    placeholder?: string;
    type?: 'multi' | 'movie' | 'tv' | 'person';
    debounceMs?: number;
    minLength?: number;

    onResults?: (payload: {
      query: string;
      results: any[];
      meta: {
        page: number;
        totalPages: number;
        totalResults: number;
      };
    }) => void;

    onClear?: () => void;
    onError?: (message: string) => void;
  }>();

  const {
    placeholder = 'Search movies, shows, people…',
    type = 'movie',
    debounceMs = 300,
    minLength = 2
  } = props;

  let query = $state('');
  let loading = $state(false);

  let timeout: ReturnType<typeof setTimeout> | null = null;

  async function runSearch() {
    const trimmed = query.trim();

    if (trimmed.length < minLength) {
      props.onClear?.();
      return;
    }

    loading = true;

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}&type=${type}`
      );

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();

      props.onResults?.({
        query: trimmed,
        results: data.results ?? [],
        meta: {
          page: data.page,
          totalPages: data.total_pages,
          totalResults: data.total_results
        }
      });
    } catch {
      props.onError?.('Search failed');
    } finally {
      loading = false;
    }
  }

  function onInput() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(runSearch, debounceMs);
  }

  function clear() {
    query = '';
    props.onClear?.();
  }

  $effect(() => {
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  });
</script>

<div class="relative w-full">
  <input
    type="search"
    bind:value={query}
    oninput={onInput}
    placeholder={placeholder}
    class="w-full px-4 py-2 rounded-lg
           bg-zinc-900 text-zinc-100
           border border-zinc-700
           focus:border-indigo-500
           outline-none"
  />

  {#if query && !loading}
    <button
      type="button"
      onclick={clear}
      class="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
      aria-label="Clear search"
    >
      ✕
    </button>
  {/if}

  {#if loading}
    <div class="absolute right-3 top-2.5 text-zinc-400 text-sm">
      Searching…
    </div>
  {/if}
</div>
