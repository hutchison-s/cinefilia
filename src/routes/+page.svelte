<script lang="ts">
	import LandingPage from '$lib/components/LandingPage.svelte';
	import HorizontalMovieScroll from '$lib/components/HorizontalMovieScroll.svelte';
	import HomeDiscoveryRailSkeleton from '$lib/components/HomeDiscoveryRailSkeleton.svelte';
	import Button from '$lib/components/Button.svelte';
	import SectionEyebrow from '$lib/components/SectionEyebrow.svelte';
	import { goto } from '$app/navigation';
	import { homeDiscoveryStore } from '$lib/state/homeDiscoveryStore';
    
    let { data } = $props()
	const homeDiscovery = homeDiscoveryStore;

    const createdAtSort = (a: {createdAt: Date}, b: {createdAt: Date}, dir: 'asc' | 'desc' = 'desc') => {
        if (dir == 'asc') return a.createdAt.getTime() - b.createdAt.getTime()
        return b.createdAt.getTime() - a.createdAt.getTime()
    }

	const reloadHomeDiscovery = () => {
		const userId = data.user?.id;

		if (!userId) {
			return;
		}

		homeDiscovery.reset();
		void homeDiscovery.ensureLoaded(fetch, userId);
	};

	$effect(() => {
		const userId = data.user?.id ?? null;

		homeDiscovery.syncUser(userId);

		if (userId) {
			void homeDiscovery.ensureLoaded(fetch, userId);
		}
	});

</script>

<svelte:head>
	<title>Home - Cinefilia</title>
</svelte:head>

{#if !data.session}
 <LandingPage />
{:else} 
    <section class="mx-auto max-w-7xl px-6 pt-10 pb-4 sm:px-12 lg:px-20">
        <div class="max-w-3xl">
            <SectionEyebrow text="Welcome back" textClass="mb-6" />
            <h1 class="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your next great movie night
                <span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary">
                    starts here.
                </span>
            </h1>
            <p class="mt-5 max-w-2xl text-base font-light leading-relaxed text-slate-300 sm:text-lg">
                Pick up where you left off, revisit what you loved, and keep your watchlist moving.
            </p>
        </div>
    </section>

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

	{#if $homeDiscovery.status === 'idle' || $homeDiscovery.status === 'loading'}
	<HomeDiscoveryRailSkeleton
		title="Personalized Picks Loading"
		subtitle="Mixing your watch history into fresh recommendations"
	/>
	<HomeDiscoveryRailSkeleton
		title="Now Playing Loader"
		subtitle="Scanning theaters for something worth leaving the couch for"
		cardCount={10}
	/>
	{:else if $homeDiscovery.status === 'error'}
	<div class="mx-4 mt-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 px-5 py-6 text-center text-slate-200">
		<p class="text-lg font-medium text-white">Fresh picks hit a snag.</p>
		<p class="mt-2 text-sm text-slate-300">
			{$homeDiscovery.error ?? 'The recommendation rails could not be loaded right now.'}
		</p>
		<Button type='primary' btnClass="mx-auto mt-4 px-4 block" on:click={reloadHomeDiscovery}>
			Try Again
		</Button>
	</div>
	{:else}
	    {#each $homeDiscovery.recommendationSections ?? [] as section}
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

	    {#if $homeDiscovery.inTheaters?.length}
	    <h3 class="w-full border-y border-primary bg-gradient-to-br via-transparent to-primary/50 text-center font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-6">
	        In Theaters
	    </h3>
	    <HorizontalMovieScroll
	        movies={$homeDiscovery.inTheaters}
	        maxDisplay={20}
	        showRatings={false}
	        viewAllTextClass="text-2xl text-center"
	    />
	    {/if}
	{/if}

    <Button type='primary' btnClass="mx-auto px-4 block my-6" on:click={()=>goto('/explore')} >Explore Movies</Button>



{/if}
