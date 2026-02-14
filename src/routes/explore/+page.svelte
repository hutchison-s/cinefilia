<script lang="ts">
  import ImageGrid from '$lib/components/ImageGrid.svelte';
  import HorizontalScrollContainer from '$lib/components/HorizontalScrollContainer.svelte';
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
  <title>Explore - Cinefilia</title>
</svelte:head>

<section class="px-4 py-6 space-y-6">
  <h1 class="text-3xl uppercase font-thin text-white">Explore</h1>
  <p class="text-slate-300">Browse by genre, decade, or actor.</p>

  {#each data.categories as category}
    <div class="space-y-3">
      <a href={category.href} class="block border-y border-primary bg-gradient-to-br via-transparent to-primary/50 px-3 py-2">
        <h2 class="text-white uppercase font-thin text-xl">{category.title}</h2>
      </a>

      <HorizontalScrollContainer snapMode="proximity" outerClass="p-0 py-1">
        {#each category.items as item}
          <a
            href={item.href}
            class="snap-start w-36 flex flex-col items-center gap-2"
          >
            {#if item.imageGridPaths && item.imageGridPaths.length}
              <ImageGrid images={item.imageGridPaths} alt={item.label} />
            {:else if item.imagePath}
              <img
                src={item.imagePath}
                alt={item.label}
                class="w-32 h-48 rounded-md object-cover border border-slate-700"
              />
            {:else}
              <div class="w-32 h-48 rounded-md bg-gray-700 border border-slate-700 flex items-center justify-center text-gray-300 text-xs">
                No Image
              </div>
            {/if}
            <span class="text-gray-200 text-sm text-center leading-tight min-h-10">{item.label}</span>
          </a>
        {/each}
      </HorizontalScrollContainer>
    </div>
  {/each}
</section>
