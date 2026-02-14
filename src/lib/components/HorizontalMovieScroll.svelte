<script lang="ts">
    import { ArrowRight } from 'lucide-svelte';
    import HorizontalScrollContainer from '$lib/components/HorizontalScrollContainer.svelte';
    import MovePosterDisplay from '$lib/components/MovePosterDisplay.svelte';

    type ScrollMovie = {
        mediaId: number | string;
        title: string;
        posterPath?: string | null;
        rating?: number | string | null;
    };

    const props = $props<{
        movies?: ScrollMovie[];
        viewMoreLink: string;
        maxDisplay?: number;
        snapMode?: 'mandatory' | 'proximity';
        showRatings?: boolean;
        showArrowOnViewAll?: boolean;
        viewAllTextClass?: string;
    }>();

    const maxDisplay = $derived(props.maxDisplay ?? 8);
    const movies = $derived(props.movies ?? []);
    const visibleMovies = $derived(movies.slice(0, maxDisplay));
    const hasMore = $derived(movies.length > maxDisplay);
</script>

<HorizontalScrollContainer snapMode={props.snapMode}>
    {#each visibleMovies as item (item.mediaId)}
        <MovePosterDisplay {item} showRatings={props.showRatings} />
    {/each}
    {#if hasMore}
        <a href={props.viewMoreLink} class="snap-start flex flex-col w-36 items-center gap-2 justify-center border-2 border-dashed border-gray-600 rounded-md text-gray-400">
            <span class={props.viewAllTextClass ?? 'text-sm text-center text-primary'}>View All</span>
            {#if props.showArrowOnViewAll}
                <ArrowRight />
            {/if}
        </a>
    {/if}
</HorizontalScrollContainer>
