<script lang="ts">
  import BasicCard from './BasicCard.svelte';
	import StarDisplay from './StarDisplay.svelte';

  const props = $props<{
    title: string;
    poster_path?: string;
    rating?: number;
    release_date?: string;
    releaseYear?: number;
    onClick?: () => void;
  }>();

  const releaseYear = props.releaseYear ?? props.release_date
    ? new Date(props.release_date).getFullYear()
    : null;
</script>

<BasicCard cardClass="relative flex gap-3 p-3" onClick={props.onClick}>

  <!-- Poster -->
  {#if props.poster_path}
    <img
      src={`https://image.tmdb.org/t/p/w92${props.poster_path}`}
      alt={`Poster of ${props.title}`}
      class="w-14 h-auto rounded-md z-10"
    />
  {:else}
    <div
      class="w-14 h-20 bg-gray-700 rounded-md
             flex items-center justify-center
             text-gray-400 text-sm z-10"
    >
      No Image
    </div>
  {/if}

  <!-- Content -->
  <div class="flex flex-col gap-1 flex-1 z-10">
      <h3 class="text-2xl text-left w-full text-white font-semibold leading-tight">
        {props.title}
      </h3>
      <div class="flex gap-4 items-center">
        {#if releaseYear}
        <p class="text-left text-xl text-gray-400">{releaseYear}</p>
      {/if}
      {#if props.rating}
        <StarDisplay rating={props.rating} size="md" />
      {/if}
      </div>
      
  </div>
</BasicCard>

<style>
  /* Fade backdrop image toward bottom-right */
  .backdrop-mask {
    -webkit-mask-image: linear-gradient(
      to bottom right,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.85) 40%,
      rgba(0, 0, 0, 0.4) 65%,
      rgba(0, 0, 0, 0) 100%
    );
    mask-image: linear-gradient(
      to bottom right,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.85) 40%,
      rgba(0, 0, 0, 0.4) 65%,
      rgba(0, 0, 0, 0) 100%
    );

    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;

    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
  }
</style>
