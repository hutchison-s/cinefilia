<script lang="ts">
  const props = $props<{
    name: string;
    profilePath?: string | null;
    href: string;
  }>();

  function initials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
</script>

<a
  href={props.href}
  class="w-full rounded-lg border border-slate-700 bg-black/35 p-3 flex items-center gap-3 hover:border-primary transition"
>
  <div class="rounded-full w-14 h-14 overflow-hidden shrink-0">
  {#if props.profilePath}
    <img
      src={`https://image.tmdb.org/t/p/w185${props.profilePath}`}
      alt={props.name}
      class="w-full h-full aspect-square object-cover"
    />
  {:else}
    <div class="w-14 h-14 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-sm">
      {initials(props.name)}
    </div>
  {/if}
  </div>

  <span class="text-white text-lg leading-tight">{props.name}</span>
</a>
