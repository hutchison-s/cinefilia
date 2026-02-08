<script lang="ts">
	import { Search } from "lucide-svelte";

  const props = $props<{
    onOpen: () => void;
  }>();
</script>

<div class="relative">
  <input
    type="search"
    placeholder="Search…"
    readonly
    onfocus={props.onOpen}
    onclick={props.onOpen}
    class="
      w-40
      cursor-pointer
      bg-transparent
      text-gray-200
      border border-white/20
      rounded-full
      py-1 px-3 pr-10
      focus:outline-none
    "
  />

  <!-- icon -->
  <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
    <Search class="w-4 h-4 text-gray-400" />
  </div>
</div>
