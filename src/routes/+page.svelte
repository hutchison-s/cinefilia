<script lang="ts">
	import LandingPage from '$lib/components/LandingPage.svelte';
    
    let { data } = $props()

</script>

{#if !data.session}
 <LandingPage />
{:else} 
    {#snippet scrollList(list)}
        <div class="p-2 py-6 border-y-2 border-white/10 w-full overflow-y-hidden overflow-x-auto">
            <div class="flex space-x-2 snap-x snap-proximity w-fit">
                {#each list as item}
                    <a href={`/movie/${item.mediaId}`} class="snap-start flex flex-col w-36 items-center gap-2">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                        alt={`Poster of ${item.title}`}
                        class="w-32 h-auto rounded-md z-10"
                        />
                        <span class="text-gray-300 text-sm text-center">{item.title}</span>
                    </a>
                {/each}
            </div>
        </div>
    {/snippet}  
    <h3 class="text-center font-thin uppercase text-gray-400 text-lg font-semibold mb-2 mt-2">Watch Next</h3>
    {@render scrollList(data.watchNext)}
    <h3 class="text-center font-thin uppercase text-gray-400 text-lg font-semibold mb-2 mt-6">Watched List</h3>
    {@render scrollList(data.watched)}
{/if}


