<script lang="ts">
	import LandingPage from '$lib/components/LandingPage.svelte';
	import StarDisplay from '$lib/components/StarDisplay.svelte';
    
    let { data } = $props()

</script>

{#if !data.session}
 <LandingPage />
{:else} 
    <a href="/watch-next"><h3 class="text-center font-thin uppercase text-gray-400 text-lg font-semibold mb-2 mt-2">Watch Next</h3></a>
    <div class="p-2 py-6 border-y-2 border-white/10 w-full overflow-y-hidden overflow-x-auto">
            <div class="flex space-x-2 snap-x snap-proximity w-fit">
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
    <a href="/watched"><h3 class="text-center font-thin uppercase text-gray-400 text-lg font-semibold mb-2 mt-6">Watched List</h3></a>
    <div class="p-2 py-6 border-y-2 border-white/10 w-full overflow-y-hidden overflow-x-auto">
            <div class="flex space-x-2 snap-x snap-proximity w-fit">
                {#each data.watched?.slice(0,8) as item}
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
                <a href="/watched" class="snap-start flex flex-col w-36 items-center gap-2 justify-center border-2 border-dashed border-gray-600 rounded-md text-gray-400">
                    <span class="text-sm text-center text-primary">View All</span>
                </a>
                {/if}
            </div>
        </div>
{/if}


