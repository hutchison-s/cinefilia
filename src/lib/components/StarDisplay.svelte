<script lang="ts">
  import { Star } from 'lucide-svelte';

  interface StarDisplayProps {
    rating: number;          // 0–5, halves allowed
    size: 'sm' | 'md' | 'lg';  // default 'md'
  }
  const props: StarDisplayProps = $props();

  const { rating, size } = $derived(props);
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  function starFill(index: number) {
    if (rating >= index + 1) return 1;
    if (rating >= index + 0.5) return 0.5;
    return 0;
  }
</script>
  <!-- Star rating -->
  <div class="flex gap-1 items-center">
    {#each Array(5) as _, i}
      <div class={`relative ${sizeClasses[size || 'md']}`}>
        <!-- empty -->
        <Star
          class={`absolute inset-0 ${sizeClasses[size || 'md']} text-zinc-600`}
          stroke-width="1.5"
        />

        {#if starFill(i) > 0}
          <!-- filled -->
          <Star
            class={`absolute inset-0 ${sizeClasses[size || 'md']} text-yellow-400 fill-yellow-400`}
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
