<script lang="ts">
	import { goto } from '$app/navigation';
	import BasicCard from '$lib/components/BasicCard.svelte';
	import LandingPage from '$lib/components/LandingPage.svelte';
	import MovieCardWithActions from '$lib/components/MovieCardWithActions.svelte';


    let { data } = $props()

</script>

{#if !data.session}
 <LandingPage />
{:else}
    <h2 class="text-gray-200 text-xl text-center font-bold mb-4">Welcome back{data.user?.name ? `, ${data.user.name}` : ''}!</h2>
    
    <h3 class="bg-clip-text text-transparent bg-gradient-secondary text-lg font-semibold mb-2 mt-6">Watch Next</h3>
    <div class="p-2 border-y-2 border-white/10 w-full overflow-y-hidden overflow-x-auto">
        <div class="flex space-x-2 snap-x snap-proximity w-fit">
            {#each data.watchNext as item}
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
    <h3 class="bg-clip-text text-transparent bg-gradient-secondary text-lg font-semibold mb-2 mt-6">Watched List</h3>
    <div class="p-2 border-y-2 border-white/10 w-full overflow-y-hidden overflow-x-auto">
        <div class="flex space-x-2 snap-x snap-proximity w-fit">
            {#each data.watched as item}
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
{/if}


