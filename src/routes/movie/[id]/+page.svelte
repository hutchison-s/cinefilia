<script lang="ts">
	import Button from "$lib/components/Button.svelte";

    export let data: { movie: any };
    const { movie } = data;
    const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

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
            alert('Movie marked as watched!');
        } else {
            alert('Failed to mark movie as watched.');
        }
    };

</script>
<div class="flex flex-col md:flex-row gap-6 h-full overflow-auto p-6">
    <div class="flex flex-col gap-4">
        <img src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`} alt={movie?.title} class="rounded-lg shadow-lg" />
        <h1 class="text-white text-3xl font-bold">{movie?.title}</h1>
        <p class="text-gray-400 text-lg">{releaseYear}</p>
        <p class="text-gray-200">{movie?.overview}</p>
        <div class="flex gap-2 items-center">
            <Button type="primary" on:click={handleAddToWatchNext}>
                Add to WatchNext
            </Button>
            <Button type="secondary" on:click={handleMarkAsWatched}>
                Mark as Watched
            </Button>
        </div>
    </div>
</div>