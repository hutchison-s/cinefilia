<script lang="ts">
	import LandingPage from '$lib/components/LandingPage.svelte';
	import HorizontalMovieScroll from '$lib/components/HorizontalMovieScroll.svelte';
    import HorizontalScrollContainer from '$lib/components/HorizontalScrollContainer.svelte';
    
    let { data } = $props()

    const createdAtSort = (a: {createdAt: Date}, b: {createdAt: Date}, dir: 'asc' | 'desc' = 'desc') => {
        if (dir == 'asc') return a.createdAt.getTime() - b.createdAt.getTime()
        return b.createdAt.getTime() - a.createdAt.getTime()
    }

</script>

{#if !data.session}
 <LandingPage />
{:else} 
    <a href="/watch-next">
        <h3 class="text-center border-y border-primary bg-gradient-to-br via-transparent to-primary/50 font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-2">
            Watch Next
        </h3>
    </a>
    <HorizontalMovieScroll 
        movies={data.watchNext?.sort((a,b)=>createdAtSort(a,b,'asc'))} 
        viewMoreLink="/watch-next" 
        maxDisplay={8} 
        showArrowOnViewAll={true}
        viewAllTextClass="text-2xl text-center"
    />
    <a href="/watched">
        <h3 class="w-full border-y border-primary bg-gradient-to-br via-transparent to-primary/50 text-center font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-2">
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
        <h3 class="text-center border-y border-primary bg-gradient-to-br via-transparent to-primary/50 font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-2">
            In Theaters
        </h3>
    <HorizontalMovieScroll 
        movies={data.inTheaters} 
        viewMoreLink="/explore" 
        maxDisplay={30}
    />
    <a href="/explore">
        <h3 class="text-center border-y border-primary bg-gradient-to-br via-transparent to-primary/50 font-thin uppercase text-white text-xl font-semibold py-2 mb-2 mt-2">
            Explore Movies
        </h3>
    </a>
    <HorizontalScrollContainer>
        <a href="/explore/genre" class="snap-start w-36 flex flex-col items-center gap-2">
            <div class="w-32 h-48 rounded-md border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-700 flex items-end p-3">
                <span class="text-white text-lg font-thin uppercase">Genre</span>
            </div>
        </a>
        <a href="/explore/decade" class="snap-start w-36 flex flex-col items-center gap-2">
            <div class="w-32 h-48 rounded-md border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-700 flex items-end p-3">
                <span class="text-white text-lg font-thin uppercase">Decade</span>
            </div>
        </a>
        <a href="/explore/actor" class="snap-start w-36 flex flex-col items-center gap-2">
            <div class="w-32 h-48 rounded-md border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-700 flex items-end p-3">
                <span class="text-white text-lg font-thin uppercase">Actor</span>
            </div>
        </a>
    </HorizontalScrollContainer>
{/if}
