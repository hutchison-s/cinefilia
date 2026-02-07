<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/icon.png';
	import watermark from '$lib/assets/logo.png';
	import type { LayoutData } from './$types';

  const { data, children } = $props<{
    data: LayoutData;
  }>();

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<img src={watermark} alt="Cinefilia" class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 aspect-square pointer-events-none select-none" />
<main class="inset-0 h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-black via-slate-950 to-gray-900">
<header class="bg-black/50 p-4 shadow-lg">
	<a href="/" class="flex items-center gap-1">
		<img src={favicon} alt="Cinefilia" class="w-6 h-6" />
		<span class="text-white font-bold text-lg">Cinefilia</span>
	</a>
</header>
<div class="w-full px-6 py-4">
{@render children()}
</div>
<footer class="absolute w-full bottom-0 p-2 bg-black/50 text-center text-sm">
	{#if data.session}
  <div class="text-center text-sm text-slate-600">
    Logged in as <span class="font-medium text-slate-400">{data.session.user.email}</span>
  </div>
  <button class="absolute right-1 bottom-1 text-pink-500 p-1 px-3 hover:bg-primary/20 rounded-tl-lg rounded-bl-lg font-medium"
	onclick={() => {
		fetch('/logout', { method: 'POST' }).then(() => {
			window.location.href = '/';
		});
	}}>
	Logout
</button>
{/if}

</footer>
</main>