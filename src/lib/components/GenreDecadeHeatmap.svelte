<script lang="ts">
  const props = $props<{
    genres: string[];
    decades: string[];
    cells: Record<string, number>;
    maxCount: number;
  }>();

  function intensity(count: number, maxCount: number) {
    if (!maxCount || count <= 0) return '0.06';
    const t = count / maxCount;
    // Keep low values visible and high values distinct.
    const alpha = 0.12 + t * 0.78;
    return alpha.toFixed(2);
  }

  function shortGenreLabel(name: string, max = 8) {
    return name.length > max ? `${name.slice(0, max)}…` : name;
  }
</script>

{#if props.genres.length === 0 || props.decades.length === 0}
  <p class="text-slate-400 text-sm">Not enough data for heat map yet.</p>
{:else}
  <div class="w-full overflow-x-auto">
    <div
      class="grid gap-1 w-full min-w-full"
      style={`grid-template-columns: 2rem repeat(${props.decades.length}, minmax(3rem, 1fr));`}
    >
      <div class="text-[10px] text-slate-400 p-1 text-center"></div>
      {#each props.decades as decade}
        <div class="text-xs text-slate-300 text-center p-1">{decade}</div>
      {/each}

      {#each props.genres as genre}
        <div class="w-full rounded overflow-hidden flex items-center justify-center">
          <span
            class="text-[10px] text-slate-200 whitespace-nowrap [writing-mode:vertical-rl] rotate-180 text-center overflow-hidden"
            title={genre}
          >
            {shortGenreLabel(genre)}
          </span>
        </div>
        {#each props.decades as decade}
          {@const key = `${genre}|${decade}`}
          {@const count = props.cells[key] ?? 0}
          <div
            class="w-full aspect-[3/4] rounded border border-slate-800 flex items-center justify-center text-[10px] text-slate-100"
            style={`background-color: rgba(46, 162, 212, ${intensity(count, props.maxCount)});`}
            title={`${genre} / ${decade}: ${count}`}
          >
            {count || ''}
          </div>
        {/each}
      {/each}
    </div>
  </div>
{/if}
