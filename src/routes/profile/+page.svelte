<script lang="ts">
  import GenreDecadeHeatmap from '$lib/components/GenreDecadeHeatmap.svelte';

  const { data } = $props();

  const joinedDate = $derived(
    data.profile.joinedAt
      ? new Date(data.profile.joinedAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : 'Unknown'
  );
</script>

<svelte:head>
  <title>Profile - Cinefilia</title>
</svelte:head>

<section class="max-w-3xl mx-auto px-4 py-6 space-y-6">
  <h1 class="text-center border-y border-primary bg-gradient-to-br via-transparent to-primary/50 font-thin uppercase text-white text-2xl font-semibold py-2">
    Profile
  </h1>

  <div class="rounded-lg border border-slate-700 bg-black/35 p-4 space-y-2">
    <p class="text-white"><span class="text-slate-400">Name:</span> {data.profile.name}</p>
    <p class="text-white"><span class="text-slate-400">Email:</span> {data.profile.email}</p>
    <p class="text-white"><span class="text-slate-400">Joined:</span> {joinedDate}</p>
  </div>

  <div class="space-y-3">
    <h2 class="text-center border-y border-primary bg-gradient-to-br via-transparent to-primary/50 font-thin uppercase text-white text-2xl font-semibold py-2">
      Stats
    </h2>

    <div class="rounded-lg border border-slate-700 bg-black/35 p-4 grid grid-cols-2">
      <p class="text-white">Watched: <span class="text-secondary">{data.counts.watched}</span></p>
      <p class="text-white">Watch Next: <span class="text-secondary">{data.counts.watchNext}</span></p>
    </div>
    <div class="space-y-2">
      <div class="rounded-lg w-full">
        <GenreDecadeHeatmap
          genres={data.heatmap.genres}
          decades={data.heatmap.decades}
          cells={data.heatmap.cells}
          maxCount={data.heatmap.maxCount}
        />
      </div>
    </div>
    <div class="space-y-2">
      <h3 class="text-white font-semibold border-l-4 border-primary pl-4">Count By Genre</h3>
      <div class="rounded-lg border border-slate-700 bg-black/35 p-4">
      {#if data.byGenre.length === 0}
        <p class="text-slate-400 text-sm">No genre data yet.</p>
      {:else}
        <ol class="space-y-1 list-decimal list-inside marker:text-slate-400">
          {#each data.byGenre as row}
            <li class="text-white text-sm flex justify-between">
              <span>{row.genreName}</span>
              <span class="text-secondary">{row.count}</span>
            </li>
          {/each}
        </ol>
      {/if}
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-white font-semibold border-l-4 border-primary pl-4">Count By Decade</h3>
      <div class="rounded-lg border border-slate-700 bg-black/35 p-4">
      {#if data.byDecade.length === 0}
        <p class="text-slate-400 text-sm">No decade data yet.</p>
      {:else}
        <ol class="space-y-1 list-decimal list-inside marker:text-slate-400">
          {#each data.byDecade as row}
            <li class="text-white text-sm flex justify-between">
              <span>{row.label}</span>
              <span class="text-secondary">{row.count}</span>
            </li>
          {/each}
        </ol>
      {/if}
      </div>
    </div>
  </div>
</section>
