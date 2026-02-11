<script lang="ts">
  import StarInput from './StarInput.svelte';

  const props = $props<{
    isOpen: boolean;
    initialRating?: number;
    initialReview?: string;
    onSubmit: (payload: { rating: number; review: string }) => void;
    onClose: () => void;
  }>();

  let {
    isOpen,
    initialRating = 0,
    initialReview = '',
    onSubmit,
    onClose
  } = $derived(props);

  let rating = $state(0);
  let review = $state('');

  $effect(() => {
    if (isOpen) {
      rating = initialRating;
      review = initialReview;
    }
  });

  const handleSubmit = () => {
    onSubmit({ rating, review });
    handleClose();
  };

  const handleClose = () => {
    rating = 0;
    review = '';
    onClose();
  };

  const handleRatingChange = (newRating: number) => {
    rating = newRating;
  };

  const isEditing = $derived(
    initialRating > 0 || initialReview.length > 0
  );
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="review-title"
  >
    <div class="bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
      <h2
        id="review-title"
        class="text-2xl font-bold text-white mb-4"
      >
        {isEditing ? 'Edit Review' : 'Write a Review'}
      </h2>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="rating" class="text-white font-semibold">
            Your Rating:
          </label>
          <div id="rating">
            <StarInput
              value={rating}
              onChange={handleRatingChange}
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="review" class="text-white font-semibold">
            Your Review:
          </label>
          <textarea
            id="review"
            bind:value={review}
            rows="4"
            class="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your review here..."
          ></textarea>
        </div>

        <div class="flex gap-2 justify-end">
          <button
            type="button"
            onclick={handleClose}
            class="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleSubmit}
            class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
