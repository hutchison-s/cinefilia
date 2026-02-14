<script lang="ts">
  const { images, alt } = $props<{
    images?: string[] | null;
    alt: string;
  }>();
</script>

{#if images && images.length > 0}
  <div class="w-32 h-48 rounded-md overflow-hidden border border-slate-700 grid grid-cols-2 gap-px bg-slate-800">
    {#each images.slice(0, 4) as image, i}
      <img
        src={image}
        alt={`${alt} poster ${i + 1}`}
        class="w-full h-full object-cover"
      />
    {/each}
  </div>
{:else}
  <div class="w-32 h-48 rounded-md bg-gray-700 border border-slate-700 flex items-center justify-center text-gray-300 text-xs">
    No Image
  </div>
{/if}
