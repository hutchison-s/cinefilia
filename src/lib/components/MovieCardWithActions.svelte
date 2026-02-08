<script lang="ts">
  import BasicCard from './BasicCard.svelte';
  import Button from './Button.svelte';

  const props = $props<{
    title: string;
    poster_path?: string;
    backdrop_path?: string;
    release_date?: string;
    onClick?: () => void;
    onAddToWatchlist?: () => void;
    onMarkAsWatched?: () => void;
  }>();

  const {
    title,
    poster_path,
    backdrop_path,
    release_date,
    onAddToWatchlist,
    onMarkAsWatched
  } = props;

  const releaseYear = release_date
    ? new Date(release_date).getFullYear()
    : null;
</script>

<BasicCard cardClass="relative flex gap-3 p-3" onClick={props.onClick}>
  {#if backdrop_path}
    <!-- Backdrop layer -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-xl">
      <img
        src={`https://image.tmdb.org/t/p/w500${backdrop_path}`}
        alt=""
        class="w-full h-full object-cover rounded-xl
               saturate-25 brightness-50 blur-xs
               backdrop-mask"
      />
      <!-- contrast overlay -->
      <div class="absolute inset-0 bg-black/40 rounded-xl" ></div>
    </div>
  {/if}

  <!-- Poster -->
  {#if poster_path}
    <img
      src={`https://image.tmdb.org/t/p/w92${poster_path}`}
      alt={`Poster of ${title}`}
      class="w-20 h-auto rounded-md z-10"
    />
  {:else}
    <div
      class="w-20 h-28 bg-gray-700 rounded-md
             flex items-center justify-center
             text-gray-400 text-sm z-10"
    >
      No Image
    </div>
  {/if}

  <!-- Content -->
  <div class="flex flex-col justify-between flex-1 z-10">
    <div>
      <h3 class="text-xl text-white font-semibold leading-tight">
        {title}
      </h3>
      {#if releaseYear}
        <p class="text-sm text-gray-400">{releaseYear}</p>
      {/if}
    </div>

    <div class="flex gap-2 mt-3">
      {#if onAddToWatchlist}
        <Button on:click={onAddToWatchlist}>
          Add to Watch Next
        </Button>
      {/if}

      {#if onMarkAsWatched}
        <Button
          type={onAddToWatchlist ? 'secondary' : 'primary'}
          on:click={onMarkAsWatched}
        >
          Mark as Watched
        </Button>
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
