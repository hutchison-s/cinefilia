<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import ReviewModal from "$lib/components/ReviewModal.svelte";
	import { CircleCheck } from "lucide-svelte";
	import type { LayoutServerData } from "../../$types";
    import type { LayoutServerData as LocalLayoutServerData } from "./$types";
	import ReviewCard from "$lib/components/ReviewCard.svelte";

    let {data} = $props<{data: LocalLayoutServerData & LayoutServerData}>()
    const releaseYear = $derived(data.movie?.release_date ? new Date(data.movie.release_date).getFullYear() : 'N/A');

    let showReviewModal = $state(false);

    const handleAddToWatchNext = async () => {
        const response = await fetch(`?/addToWatchNext`, {
            method: 'POST',
            body: new FormData()
        });
        if (response.ok) {
            alert('Movie added to your Watchlist!');
        } else {
            alert('Failed to add movie to Watchlist.');
        }
    };

    const handleMarkAsWatched = async () => {
        const response = await fetch(`?/markWatched`, {
            method: 'POST',
            body: new FormData()
        });
        if (response.ok) {
            showReviewModal = true;
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
            alert('Review added successfully!');
        } else {
            alert('Failed to add review.');
        }
    };

</script>
<div class="flex flex-col md:flex-row gap-6 h-full overflow-auto p-6">
    <div class="flex flex-col gap-4">
        <img src={`https://image.tmdb.org/t/p/w500${data.movie?.poster_path}`} alt={data.movie?.title} class="rounded-lg shadow-lg" />
        <h1 class="text-white text-3xl font-bold">{data.movie?.title}</h1>
        <p class="text-gray-400 text-lg">{releaseYear}</p>
        <p class="text-gray-200">{data.movie?.overview}</p>
        <div class="flex gap-2 items-center">
            {#if data.watched.find(item => item.mediaId === data.movie?.id.toString())}
                <span class="text-green-400 font-semibold flex gap-2 items-center"><CircleCheck class="text-green-400"/> Watched</span>
            {:else if data.watchNext.find(item => item.mediaId === data.movie?.id.toString())}
                <span class="text-primary font-semibold flex gap-2 items-center"><CircleCheck class="text-primary"/> In Watch Next</span>
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
        <ReviewCard
            rating={data.movie?.rating || 0}
            review={data.reviews.find((r) => r.mediaId === data.movie?.id.toString())?.reviewText || ''}
            onClick={() => showReviewModal = true}
        />
    </div>
</div>

<ReviewModal
  isOpen={showReviewModal}
  initialRating={data.movie?.rating || 0}
  initialReview={data.reviews.find((r) => r.mediaId === data.movie?.id.toString())?.reviewText || ''}
  onSubmit={handleReviewSubmit}
  onClose={() => (showReviewModal = false)}
/>
