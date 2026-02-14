<script lang="ts">
    import StarDisplay from '$lib/components/StarDisplay.svelte';

    type MovieItem = {
        mediaId: number | string;
        title: string;
        posterPath?: string | null;
        rating?: number | string | null;
    };

    const props = $props<{
        item: MovieItem;
        showRatings?: boolean;
    }>();
</script>

<a href={`/movie/${props.item.mediaId}`} class="snap-start flex flex-col w-36 items-center gap-2">
    {#if props.item.posterPath}
        <img
            src={`https://image.tmdb.org/t/p/w500${props.item.posterPath}`}
            alt={`Poster of ${props.item.title}`}
            class="w-32 h-auto rounded-md z-10"
        />
    {:else}
        <div class="w-32 h-48 rounded-md z-10 bg-gray-700 flex items-center justify-center text-gray-300 text-xs">
            No Image
        </div>
    {/if}
    {#if props.showRatings && props.item.rating !== null && props.item.rating !== undefined}
        <StarDisplay rating={Number(props.item.rating || 0)} size="sm" />
    {/if}
    <span class="title-clamp text-gray-300 text-sm text-center">{props.item.title}</span>
</a>

<style>
    .title-clamp {
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.25rem;
        max-height: 2.5rem;
    }
</style>
