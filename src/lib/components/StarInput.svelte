<script lang="ts">
  import { Star } from 'lucide-svelte';

  const props = $props<{
    value?: number;              // current rating (0–5, halves allowed)
    max?: number;                // default 5
    readonly?: boolean;
    onChange?: (value: number) => void;
  }>();

  const {
    value = 0,
    max = 5,
    readonly = false,
    onChange
  } = props;

  let hoverValue = $state<number | null>(null);

  function displayValue() {
    return hoverValue ?? value;
  }

  function setRating(v: number) {
    if (readonly) return;
    onChange?.(v);
  }

  function onKey(e: KeyboardEvent) {
    if (readonly) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setRating(Math.min(max, value + 0.5));
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setRating(Math.max(0, value - 0.5));
    }
  }

  function starFill(index: number) {
    const v = displayValue();
    if (v >= index + 1) return 1;
    if (v >= index + 0.5) return 0.5;
    return 0;
  }
</script>

<div
  class="flex gap-1"
  role="slider"
  aria-valuemin="0"
  aria-valuemax={max}
  aria-valuenow={value}
  tabindex={readonly ? undefined : 0}
  onkeydown={onKey}
>
  {#each Array(max) as _, i}
    <button
      type="button"
      class="relative w-6 h-6 cursor-pointer"
      disabled={readonly}
      onmouseenter={() => (hoverValue = i + 1)}
      onmouseleave={() => (hoverValue = null)}
      onclick={() => setRating(i + 1)}
      aria-label={`Rate ${i + 1} stars`}
    >
      <!-- empty star -->
      <Star
        class="absolute inset-0 w-6 h-6 text-zinc-600"
        stroke-width="1.5"
      />

      {#if starFill(i) > 0}
        <!-- filled star -->
        <Star
          class="absolute inset-0 w-6 h-6 text-yellow-400 fill-yellow-400"
          stroke-width="1.5"
          style={
            starFill(i) === 0.5
              ? 'clip-path: inset(0 50% 0 0)'
              : undefined
          }
        />
      {/if}
    </button>
  {/each}
</div>
