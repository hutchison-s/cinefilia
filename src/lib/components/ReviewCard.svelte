<script lang="ts">
  import { Star } from 'lucide-svelte';

  const props = $props<{
    rating: number;          // 0–5, halves allowed
    review?: string;
    onClick?: () => void;
  }>();

  const { rating, review = '', onClick } = $derived(props);

  function starFill(index: number) {
    if (rating >= index + 1) return 1;
    if (rating >= index + 0.5) return 0.5;
    return 0;
  }
</script>

<button
  type="button"
  onclick={onClick}
  class="
    w-full text-left
    max-w-xl
    bg-zinc-900 border border-white/10
    rounded-lg p-4
    hover:bg-zinc-800 transition
    focus:outline-none focus:ring-2 focus:ring-indigo-500
  "
>
  <!-- Star rating -->
  <div class="flex gap-1 items-center mb-2">
    {#each Array(5) as _, i}
      <div class="relative w-8 h-8">
        <!-- empty -->
        <Star
          class="absolute inset-0 w-8 h-8 text-zinc-600"
          stroke-width="1.5"
        />

        {#if starFill(i) > 0}
          <!-- filled -->
          <Star
            class="absolute inset-0 w-8 h-8 text-yellow-400 fill-yellow-400"
            stroke-width="1.5"
            style={
              starFill(i) === 0.5
                ? 'clip-path: inset(0 50% 0 0)'
                : undefined
            }
          />
        {/if}
      </div>
    {/each}
  </div>

  <!-- Review text -->
  {#if review}
    <p class="text-zinc-300 text-md leading-relaxed line-clamp-4">
      {review}
    </p>
  {:else}
    <p class="text-zinc-500 text-sm italic">
      No written review
    </p>
  {/if}
</button>
