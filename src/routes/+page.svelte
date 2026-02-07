<script lang="ts">
	import BasicCard from '$lib/components/BasicCard.svelte';
	import LandingPage from '$lib/components/LandingPage.svelte';


    const { data } = $props()

    const hasName = data.session?.user.name !== undefined && data.session?.user.name !== null && data.session?.user.name !== "";
</script>

{#if !data.session}
 <LandingPage />
{:else}
    <h2 class="text-xl text-white text-center mt-10">Welcome {hasName ? data.session.user.name : "back"}!</h2>
    <div class="grid grid-cols-3 gap-4 w-full px-6">
        <BasicCard title="Popular Movies" cardClass="w-full">
            {#if data.popular}
                {#each data.popular.results.slice(0, 10) as movie}
                    {@const date = new Date(movie.release_date)}
                    <div class="mt-2 text-white text-center">
                        {movie.title} - {date.getFullYear()}
                    </div>
                {/each}
            {/if}
        </BasicCard>
        <BasicCard title="Top Rated Movies" cardClass="w-full">
            {#if data.topRated && data.topRated.results}
                {#each data.topRated.results.slice(0, 10) as movie}
                    {@const date = new Date(movie.release_date)}
                    <div class="mt-2 text-white text-center">
                        {movie.title} - {date.getFullYear()}
                    </div>
                {/each}
            {/if}
        </BasicCard>
        <BasicCard title="Now Playing Movies" cardClass="w-full">
            {#if data.nowPlaying && data.nowPlaying.results}
                {#each data.nowPlaying.results.slice(0, 10) as movie}
                    {@const date = new Date(movie.release_date)}
                    <div class="mt-2 text-white text-center">
                        {movie.title} - {date.getFullYear()}
                    </div>
                {/each}
            {/if}
        </BasicCard>
    </div>
{/if}


