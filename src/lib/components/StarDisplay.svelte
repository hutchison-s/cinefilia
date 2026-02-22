<script lang="ts">
  import { Star } from 'lucide-svelte';

  interface StarDisplayProps {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
  }

  const props: StarDisplayProps = $props();

  const rating = $derived(props.rating);
  const size = $derived(props.size ?? 'md');

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  function starFill(index: number) {
    const starNumber = index + 1;

    if (rating >= starNumber) return 1;
    if (rating >= starNumber - 0.5) return 0.5;
    return 0;
  }
</script>
  <!-- Star rating -->
  <div class="flex gap-1 items-center">
    {#each Array(5) as _, i}
    {@const fill = starFill(i)}
      <div class={`relative ${sizeClasses[size || 'md']}`}>
        <!-- empty -->
        <Star
          class={`absolute inset-0 ${sizeClasses[size || 'md']} text-zinc-600`}
          stroke-width="1.5"
        />

        {#if fill > 0}
          <div
            class="absolute inset-0 overflow-hidden"
            style={`width: ${fill * 100}%`}
          >
            <Star
              class={`${sizeClasses[size || 'md']} text-yellow-400 fill-yellow-400`}
              stroke-width="1.5"
            />
          </div>
        {/if}
      </div>
    {/each}
  </div>
