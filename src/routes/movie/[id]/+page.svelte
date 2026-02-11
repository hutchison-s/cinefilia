<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import ReviewModal from "$lib/components/ReviewModal.svelte";
	import { CircleCheck } from "lucide-svelte";
	import ReviewCard from "$lib/components/ReviewCard.svelte";
	import { invalidateAll } from "$app/navigation";

    let {data} = $props();

    let rating = $derived(Number(data.movieWatched?.rating || 0));
    let review = $derived(data.movieReview?.body || '');

    let releaseYear = $derived(data.movie ? new Date(data.movie.release_date).getFullYear() : null);

    let showReviewModal = $state(false);

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
            data.movieWatched = { ...data.movieWatched, rating }; // Update local state with new rating
            data.movieReview = { body: review }; // Update local state with new review
            await invalidateAll(); // Refresh data to show the new review
        } else {
            alert('Failed to add review.');
        }
    };

</script>
<div class="flex flex-col gap-6 h-full overflow-auto p-2 max-w-[600px] xl:mx-auto">
    <div class="flex flex-col gap-4 ">
        <img src={`https://image.tmdb.org/t/p/w500${data.movie?.poster_path}`} alt={data.movie?.title} class="rounded-lg shadow-lg md:w-40" />
        <h1 class="text-white text-3xl font-bold">{data.movie?.title}</h1>
        <p class="text-gray-400 text-lg">{releaseYear}</p>
        <p class="text-gray-200">{data.movie?.overview}</p>
        <div class="grid grid-cols-2 gap-2 items-center">
            {#if data.movieWatched}
                <span class="text-green-400 font-semibold flex gap-2 items-center"><CircleCheck class="text-green-400"/> Watched</span>
            {:else if data.movieWatchNext}
                <Button type="danger" on:click={handleRemoveFromWatchNext}>
                    Remove from WatchNext
                </Button>
                <Button type="secondary" on:click={handleMarkAsWatched}>
                    Mark as Watched
                </Button>
            {:else}
                <Button type="primary" on:click={handleAddToWatchNext}>
                    Add to WatchNext
                </Button>
                <Button type="secondary" on:click={handleMarkAsWatched}>
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
    </div>
</div>

<ReviewModal
  isOpen={showReviewModal}
  initialRating={rating}
  initialReview={review}
  onSubmit={handleReviewSubmit}
  onClose={() => (showReviewModal = false)}
/>
