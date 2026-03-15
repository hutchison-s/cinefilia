<script lang="ts">
  let {
    disabled = false,
    delay = 250,
    onEnter
  }: {
    disabled?: boolean;
    delay?: number;
    onEnter?: () => void | Promise<void>;
  } = $props();

  let element = $state<HTMLDivElement | null>(null);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function clearDebounce() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  $effect(() => {
    const target = element;

    if (!target || disabled) {
      clearDebounce();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);

        if (!isVisible) {
          clearDebounce();
          return;
        }

        clearDebounce();
        timeout = setTimeout(() => {
          timeout = null;
          void onEnter?.();
        }, delay);
      },
      {
        rootMargin: '250px 0px'
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      clearDebounce();
    };
  });
</script>

<div bind:this={element} class="h-1 w-full" aria-hidden="true"></div>
