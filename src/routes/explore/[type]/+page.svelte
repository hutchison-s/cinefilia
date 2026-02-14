<script lang="ts">
  import HorizontalMovieScroll from '$lib/components/HorizontalMovieScroll.svelte';
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
  <title>{data.title} - Explore - Cinefilia</title>
</svelte:head>

<section class="py-4 space-y-5">
  <h1 class="text-center border-y border-primary bg-gradient-to-br via-transparent to-primary/50 font-thin uppercase text-white text-2xl font-semibold py-2">
    Explore {data.title}
  </h1>

  {#if data.sections.length === 0}
    <p class="px-4 text-slate-300">No explore sections found.</p>
  {/if}

  {#each data.sections as section}
    <div>
      <a href={section.href} class="block px-4 py-2">
        <h2 class="text-white text-xl font-thin uppercase border-l-2 border-primary pl-3">
          {section.title}
        </h2>
      </a>
      <HorizontalMovieScroll
        movies={section.movies}
        viewMoreLink={section.href}
        maxDisplay={8}
        snapMode="proximity"
        showRatings={true}
      />
    </div>
  {/each}
</section>
