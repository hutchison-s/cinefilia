<script lang="ts">
  import { SquareMinus, SquarePlus, Star } from 'lucide-svelte';

  const props = $props<{
  value?: number;
  max?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
}>();

let value = $derived(props.value ?? 0);
let max = $derived(props.max ?? 5);
let readonly = $derived(props.readonly ?? false);
let onChange = props.onChange;


  let hoverValue = $state<number | null>(null);

  function displayValue() {
    return hoverValue ?? value;
  }

  function setRating(v: number) {
    if (readonly) return;
    hoverValue = null;
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
  const starNumber = index + 1;

  if (v >= starNumber) return 1;
  if (v >= starNumber - 0.5) return 0.5;
  return 0;
}



function handleStarClick(starIdx: number) {
  if (value === starIdx) {
    // full → half
    setRating(starIdx - 0.5);
  } else if (value === starIdx - 0.5) {
    // half → full
    setRating(starIdx);
  } else {
    // new selection → full
    setRating(starIdx);
  }
}

</script>

<div
  class="flex gap-1 items-center"
  role="slider"
  aria-valuemin="0"
  aria-valuemax={max}
  aria-valuenow={value}
  tabindex={readonly ? undefined : 0}
  onkeydown={onKey}
>
<button class="p-1" onclick={()=>{setRating(Math.max(0, value - 0.5))}}>
  <SquareMinus
    class="w-10 h-10 text-zinc-600"
    stroke-width="1.5"
    aria-label="Clear rating"
  />
</button>
  {#each Array(max) as _, i}
    <button
  type="button"
  class="relative w-10 h-10 cursor-pointer"
  disabled={readonly}
  onmouseenter={() => (hoverValue = i + 1)}
  onmouseleave={() => (hoverValue = null)}
  onclick={() => handleStarClick(i + 1)}
>
  <!-- Empty star -->
  <Star
    class="absolute inset-0 w-10 h-10 text-zinc-600"
    stroke-width="1.5"
  />

  {#if starFill(i) > 0}
    <div
      class="absolute inset-0 overflow-hidden"
      style={
        starFill(i) === 0.5
          ? 'width: 50%'
          : 'width: 100%'
      }
    >
      <Star
        class="w-10 h-10 text-yellow-400 fill-yellow-400"
        stroke-width="1.5"
      />
    </div>
  {/if}
</button>

  {/each}
  <button class="p-1" onclick={()=>{setRating(Math.min(max, value + 0.5))}}>
  <SquarePlus
    class="w-10 h-10 text-zinc-600"
    stroke-width="1.5"
    aria-label="Clear rating"
  />
</button>
</div>
