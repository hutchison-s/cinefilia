<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import ReviewModal from "$lib/components/ReviewModal.svelte";
	import { CircleCheck } from "lucide-svelte";
	import ReviewCard from "$lib/components/ReviewCard.svelte";
	import { invalidateAll } from "$app/navigation";
    import { buildExploreSpecificSlug } from "$lib/utils/explore";

    let {data} = $props();

    let rating = $derived(Number(data.movieWatched?.rating || 0));
    let review = $derived(data.movieReview?.body || '');

    let releaseYear = $derived(data.movie ? new Date(data.movie.release_date).getFullYear() : null);

    let showReviewModal = $state(false);

    let topCast = $derived(data.movie?.credits.cast.slice(0,2) || [])
    let castSlice = $derived(data.movie?.credits.cast.slice(0, 8) || [])
    let movieImages = $derived(
        data.movie?.images?.backdrops?.slice(0, 8) ||
        data.movie?.images?.posters?.slice(0, 8) ||
        []
    )
    let selectedImagePath = $state<string | null>(null);
    $inspect(topCast)

    const handleAddToWatchNext = async () => {
        const response = await fetch(`?/addToWatchNext`, {
            method: 'POST',
            body: new FormData()
        });
        if (response.ok) {
            invalidateAll(); // Refresh data to show the movie in Watch Next
        } else {
            alert('Failed to add movie to Watchlist.');
        }
    };

    const handleRemoveFromWatchNext = async () => {
        const response = await fetch(`?/removeFromWatchNext`, {
            method: 'POST',
            body: new FormData()
        });
        if (response.ok) {
            invalidateAll(); // Refresh data to remove the movie from Watch Next
        } else {
            alert('Failed to remove movie from Watchlist.');
        }
    };

    const handleMarkAsWatched = async () => {
        const response = await fetch(`?/markWatched`, {
            method: 'POST',
            body: new FormData()
        });
        if (response.ok) {
            showReviewModal = true;
            if (data.movieWatchNext) {
                await handleRemoveFromWatchNext();
            }
        } else {
            alert('Failed to mark movie as watched.');
        }
    };

    const handleRemoveFromWatched = async () => {
        const response = await fetch(`?/removeFromWatched`, {
            method: 'POST',
            body: new FormData()
        });
        if (response.ok) {
            invalidateAll(); // Refresh data to remove the movie from Watched list
        } else {
            alert('Failed to remove movie from Watched list.');
        }
    };

    const handleReviewSubmit = async (payload: { rating: number; review: string }) => {
        const { rating, review } = payload;
        const formData = new FormData();
        formData.append('rating', rating.toString());
        formData.append('reviewText', review);
        
        const response = await fetch(`?/addReview`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // @ts-ignore
            data.movieWatched = { ...data.movieWatched, rating }; // Update local state with new rating
            // @ts-ignore
            data.movieReview = { ...data.movieReview, body: review }; // Update local state with new review
            await invalidateAll(); // Refresh data to show the new review
        } else {
            alert('Failed to add review.');
        }
    };

</script>
<div class="flex flex-col gap-6 h-full overflow-auto p-2 px-4 max-w-[600px] xl:mx-auto">
    <div class="flex flex-col gap-6 ">
        <div class="space-y-2">
        <img src={`https://image.tmdb.org/t/p/w500${data.movie?.poster_path}`} alt={data.movie?.title} class="rounded-lg shadow-lg md:w-40" />
        <h1 class="text-white text-3xl font-bold mt-4">{data.movie?.title}</h1>
        <div class="flex gap-3 w-full border-y border-primary py-2">
            <p class="text-secondary text-4xl">{releaseYear}</p>
            <div>
                {#each topCast as actor}
                <p class="my-0 text-sm text-gray-200 font-thin"><strong>{actor.name}</strong> as <em>{actor.character}</em></p>
                {/each}
            </div>  
        </div>
        </div>

        <p class="text-gray-400">{data.movie?.overview}</p>
        <div class="grid grid-cols-2 gap-2 items-center mb-4">
            {#if data.movieWatched}
                <span class="text-green-400 font-semibold flex gap-2 items-center">Watched <CircleCheck class="text-green-400 text-sm"/></span>
            {:else if data.movieWatchNext}
                <Button type="danger" on:click={handleRemoveFromWatchNext} btnClass="h-full w-full">
                    Remove from WatchNext
                </Button>
                <Button type="secondary" on:click={handleMarkAsWatched} btnClass="h-full w-full">
                    Mark as Watched
                </Button>
            {:else}
                <Button type="primary" on:click={handleAddToWatchNext} btnClass="h-full w-full">
                    Add to WatchNext
                </Button>
                <Button type="secondary" on:click={handleMarkAsWatched} btnClass="h-full w-full">
                    Mark as Watched
                </Button>
            {/if}
        </div>
        {#if data.movieWatched}
        <ReviewCard
            rating={rating}
            review={review}
            onClick={() => {
                showReviewModal = true;
            }}
        />
        {/if}
        
        {#if castSlice.length > 0}
            <div class="space-y-2 my-2">
                <h3 class="text-white text-lg font-semibold border-l-4 border-primary pl-6 mb-4">Cast</h3>
                <div class="w-full overflow-x-auto overflow-y-hidden">
                    <div class="flex gap-4 w-fit py-2">
                        {#each castSlice as actor}
                            <a
                                href={`/explore/actor/${buildExploreSpecificSlug('actor', actor.id, actor.name)}`}
                                class="w-24 shrink-0 flex flex-col items-center gap-2"
                            >
                                {#if actor.profile_path}
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                        alt={actor.name}
                                        loading="lazy"
                                        decoding="async"
                                        class="w-24 h-36 object-cover rounded-md border border-slate-700"
                                    />
                                {:else}
                                    <div class="w-24 h-36 rounded-md bg-gray-700 border border-slate-700 flex items-center justify-center text-gray-300 text-xs text-center p-1">
                                        No Image
                                    </div>
                                {/if}
                                <span class="text-gray-200 text-xs text-center leading-tight min-h-8">{actor.name}</span>
                            </a>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
        {#if movieImages.length > 0}
            <div class="space-y-2 my-2">
                <h3 class="text-white text-lg font-semibold border-l-4 border-primary pl-6 mb-4">Images</h3>
                <div class="w-full overflow-x-auto overflow-y-hidden">
                    <div class="flex gap-4 w-fit py-2">
                        {#each movieImages as image}
                            <img
                                src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                                alt={`Still from ${data.movie?.title}`}
                                loading="lazy"
                                decoding="async"
                                onclick={() => {
                                    selectedImagePath = image.file_path;
                                }}
                                class="w-24 h-36 object-cover rounded-md border border-slate-700 shrink-0"
                            />
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
        {#if data.movieWatched}
            <button 
                class="text-danger mt-4" 
                onclick={handleRemoveFromWatched}>
                Remove from Watched List
            </button>
        {/if}
    </div>
</div>

<ReviewModal
  isOpen={showReviewModal}
  initialRating={rating}
  initialReview={review}
  onSubmit={handleReviewSubmit}
  onClose={() => (showReviewModal = false)}
/>

{#if selectedImagePath}
  <button
    type="button"
    class="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center"
    onclick={() => {
      selectedImagePath = null;
    }}
  >
    <img
      src={`https://image.tmdb.org/t/p/original${selectedImagePath}`}
      alt={`Fullscreen still from ${data.movie?.title}`}
      class="max-w-full max-h-full object-contain rounded-md"
    />
  </button>
{/if}
