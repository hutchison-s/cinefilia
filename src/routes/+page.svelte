<script lang="ts">
	import LandingPage from '$lib/components/LandingPage.svelte';
	import StarDisplay from '$lib/components/StarDisplay.svelte';
	import { ArrowRight } from 'lucide-svelte';
    
    let { data } = $props()

    const createdAtSort = (a: {createdAt: Date}, b: {createdAt: Date}) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
    }

    let watchedSlice = $derived(data.watched?.sort(createdAtSort).slice(0, 8))

</script>

{#if !data.session}
 <LandingPage />
{:else} 
    <a href="/watch-next">
        <h3 class="text-center border-y border-primary bg-gradient-to-br via-transparent to-primary/50 font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-2">
            Watch Next
        </h3>
    </a>
    <div class="p-2 py-6 w-full overflow-y-hidden overflow-x-auto">
            <div class="flex space-x-2 snap-x snap-x-mandatory w-fit">
                {#each data.watchNext?.slice(0,8) as item}
                    <a href={`/movie/${item.mediaId}`} class="snap-start flex flex-col w-36 items-center gap-2">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                        alt={`Poster of ${item.title}`}
                        class="w-32 h-auto rounded-md z-10"
                        />
                        <span class="text-gray-300 text-sm text-center">{item.title}</span>
                    </a>
                {/each}
                {#if data.watchNext && data.watchNext.length > 8}
                <a href="/watch-next" class="snap-start flex flex-col w-36 items-center gap-2 justify-center border-2 border-dashed border-gray-600 rounded-md text-gray-400">
                    <span class="text-sm text-center text-primary">View All</span>
                </a>
                {/if}
            </div>
        </div>
    <a href="/watched">
        <h3 class="w-full border-y border-primary bg-gradient-to-br via-transparent to-primary/50 text-center font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-6">
            Watched
        </h3>
    </a>
    <div class="p-2 py-6 w-full overflow-y-hidden overflow-x-auto">
            <div class="flex space-x-2 snap-x snap-proximity w-fit">
                {#each watchedSlice as item}
                    <a href={`/movie/${item.mediaId}`} class="snap-start flex flex-col w-36 items-center gap-2">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                        alt={`Poster of ${item.title}`}
                        class="w-32 h-auto rounded-md z-10"
                        />
                        <StarDisplay rating={Number(item.rating || 0)} size="sm" />
                        <span class="text-gray-300 text-sm text-center">{item.title}</span>
                    </a>
                {/each}
                {#if data.watched && data.watched.length > 8}
                <a href="/watched" class="snap-start flex flex-col w-36 items-center gap-2 justify-center border-2 border-dashed border-gray-600 bg-black/25 rounded-md text-gray-400">
                    <span class="text-2xl text-center whitespace-wrap">View All</span>
                    <ArrowRight />
                </a>
                {/if}
            </div>
        </div>
{/if}


