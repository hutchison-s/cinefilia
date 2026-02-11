<script lang="ts">
	import { Search } from "lucide-svelte";

  const props = $props<{
    onOpen: () => void;
  }>();
</script>

<button class="p-2 text-gray-400 grid place-items-center hover:text-gray-200"
    onclick={props.onOpen}>
    <Search class="w-6 h-6 text-gray-400 hover:text-secondary" />
</button>
