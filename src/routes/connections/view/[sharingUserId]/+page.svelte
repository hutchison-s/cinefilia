<script lang="ts">
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
  <title>{data.owner.name}&apos;s Shared Lists - Cinefilia</title>
</svelte:head>

<section class="mx-auto w-full max-w-3xl px-4 py-6">
  <div class="rounded-xl border border-slate-800 bg-black/35 p-5">
    <h1 class="text-2xl font-semibold text-white">{data.owner.name}&apos;s Shared Lists</h1>
    <p class="mt-2 text-sm text-slate-400">{data.owner.email}</p>

    <div class="mt-6 flex flex-wrap gap-3">
      {#if data.availableLists.watched}
        <a
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          href={`/connections/view/${data.owner.id}/watched`}
        >
          Watched
        </a>
      {/if}

      {#if data.availableLists.watchNext}
        <a
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          href={`/connections/view/${data.owner.id}/watch-next`}
        >
          Watch Next
        </a>
      {/if}
    </div>
  </div>
</section>
