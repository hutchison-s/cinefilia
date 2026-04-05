<script lang="ts">
	import LandingPage from '$lib/components/LandingPage.svelte';
	import HorizontalMovieScroll from '$lib/components/HorizontalMovieScroll.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
    
    let { data } = $props()

    const createdAtSort = (a: {createdAt: Date}, b: {createdAt: Date}, dir: 'asc' | 'desc' = 'desc') => {
        if (dir == 'asc') return a.createdAt.getTime() - b.createdAt.getTime()
        return b.createdAt.getTime() - a.createdAt.getTime()
    }

</script>

<svelte:head>
	<title>Home - Cinefilia</title>
</svelte:head>

{#if !data.session}
 <LandingPage />
{:else} 
    <a href="/watch-next">
        <h3 class="text-center border-y border-primary bg-gradient-to-br via-transparent to-primary/50 font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-2">
            Watch Next
        </h3>
    </a>
    {#if data.watchNext?.length}
    <HorizontalMovieScroll 
        movies={data.watchNext?.sort((a,b)=>createdAtSort(a,b,'asc'))} 
        viewMoreLink="/watch-next" 
        maxDisplay={8} 
        showArrowOnViewAll={true}
        viewAllTextClass="text-2xl text-center"
    />
    {:else}
    <div class="my-6 mx-4 p-4 rounded border border-gray-400">
        <a href="/explore" class="block w-full text-center text-gray-400 text-xl font-light">Find movies to watch</a>
    </div>
    {/if}
    {#if data.watched?.length}
    <a href="/watched">
        <h3 class="w-full border-y border-primary bg-gradient-to-br via-transparent to-primary/50 text-center font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-6">
            Watched
        </h3>
    </a>
    <HorizontalMovieScroll
        movies={data.watched?.sort(createdAtSort)}
        viewMoreLink="/watched"
        maxDisplay={8}
        showRatings={true}
        showArrowOnViewAll={true}
        viewAllTextClass="text-2xl text-center"
    />
    {/if}

    {#each data.recommendationSections ?? [] as section}
    <h3 class="w-full border-y border-primary bg-gradient-to-br via-transparent to-primary/50 text-center font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-6">
        {section.title}
    </h3>
    <HorizontalMovieScroll
        movies={section.movies}
        viewMoreLink={section.viewMoreLink}
        maxDisplay={8}
        showRatings={false}
        showArrowOnViewAll={true}
        viewAllTextClass="text-2xl text-center"
    />
    {/each}

    {#if data.inTheaters?.length}
    <h3 class="w-full border-y border-primary bg-gradient-to-br via-transparent to-primary/50 text-center font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-6">
        In Theaters
    </h3>
    <HorizontalMovieScroll
        movies={data.inTheaters}
        maxDisplay={20}
        showRatings={false}
        viewAllTextClass="text-2xl text-center"
    />
    {/if}

    <Button type='primary' btnClass="mx-auto px-4 block my-6" on:click={()=>goto('/explore')} >Explore Movies</Button>



{/if}
