<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  const DESTINATION_KEY = 'post_login_destination';
  let { data } = $props();

  onMount(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const destination = `/movie/${data.mediaId}`;
    sessionStorage.setItem(DESTINATION_KEY, destination);
    goto('/login', { replaceState: true });
  });
</script>
