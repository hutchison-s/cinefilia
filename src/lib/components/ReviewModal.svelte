<script lang="ts">
  import StarInput from './StarInput.svelte';

  const props = $props<{
    isOpen: boolean;
    isNewlyWatched?: boolean;
    initialRating?: number;
    initialReview?: string;
    onSubmit: (payload: { rating: number; review: string }) => void | Promise<void>;
    onClose: () => void;
  }>();

  let {
    isOpen,
    isNewlyWatched = false,
    initialRating = 0,
    initialReview = '',
    onSubmit,
    onClose
  } = $derived(props);

  let rating = $state(0);
  let review = $state('');
  let isSubmitting = $state(false);

  $effect(() => {
    if (isOpen) {
      rating = initialRating;
      review = initialReview;
      isSubmitting = false;
    }
  });

  const handleSubmit = async () => {
    if (!hasChanges || isSubmitting) {
      return;
    }

    isSubmitting = true;

    try {
      await onSubmit({ rating, review });
      handleClose();
    } catch {
      // Keep the modal open so the user can retry after a failed save.
    } finally {
      isSubmitting = false;
    }
  };

  const handleClose = () => {
    rating = 0;
    review = '';
    isSubmitting = false;
    onClose();
  };

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleBackdropKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  const handleRatingChange = (newRating: number) => {
    rating = newRating;
  };

  const isEditing = $derived(
    initialRating > 0 || initialReview.length > 0
  );
  const hasChanges = $derived(
    rating !== initialRating || review !== initialReview
  );
  const dismissLabel = $derived(isNewlyWatched ? 'Skip' : 'Cancel');
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="review-title"
    tabindex="-1"
    onclick={handleBackdropClick}
    onkeydown={handleBackdropKeydown}
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
            {dismissLabel}
          </button>
          <button
            type="button"
            onclick={handleSubmit}
            disabled={!hasChanges || isSubmitting}
            class="px-4 py-2 rounded-md bg-blue-600 text-white transition disabled:cursor-not-allowed disabled:bg-blue-900/50 disabled:text-blue-100/60 hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
