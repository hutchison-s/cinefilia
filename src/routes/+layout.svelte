<script lang="ts">
	import { Search } from 'lucide-svelte';
	import '../app.css';
	import favicon from '$lib/assets/icon.png';
	import watermark from '$lib/assets/logo.png';
	import type { LayoutData } from './$types';
	import NavSearchBar from '$lib/components/HeaderSearch.svelte';
	import HeaderSearch from '$lib/components/HeaderSearch.svelte';
	import SearchOverlay from '$lib/components/SearchOverlay.svelte';

  const { data, children } = $props<{
    data: LayoutData;
  }>();
  const searchModalClasses = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-start py-40 z-50 transition-all';

  let isSearchOpen = $state(false);

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- <img src={watermark} alt="Cinefilia" class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 aspect-square pointer-events-none select-none" /> -->
<header class="fixed top-0 left-0 right-0 bg-black/75 backdrop-blur p-4 shadow-lg flex items-center justify-between">
	<a href="/" class="flex items-center gap-1">
		<img src={favicon} alt="Cinefilia" class="w-6 h-6" />
		<span class="text-white font-bold text-lg">Cinefilia</span>
	</a>
	<HeaderSearch onOpen={() => isSearchOpen = true} />

</header>
<main class="py-16 inset-0 h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-black via-slate-950 to-gray-900">

<div class="w-full px-6 py-4">
{@render children()}
</div>
<footer class="absolute w-full bottom-0 flex justify-between items-center p-2 bg-black text-center text-sm">
	{#if data.session}
  <div class="text-center text-sm text-slate-600">
    Logged in as <span class="font-medium text-slate-400">{data.session.user.email}</span>
  </div>
  <button class="bg-primary text-white brightness-50 p-1 px-3 hover:brightness-100 rounded-tl-lg rounded-bl-lg font-medium"
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
{#if isSearchOpen}
  <SearchOverlay onClose={() => isSearchOpen = false} />
{/if}