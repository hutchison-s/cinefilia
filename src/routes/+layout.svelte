<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/icon.png';
	import type { LayoutData } from './$types';
	import HeaderSearch from '$lib/components/HeaderSearch.svelte';
	import SearchOverlay from '$lib/components/SearchOverlay.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { page } from '$app/stores';

  const { data, children } = $props();
  const searchModalClasses = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-start py-40 z-50 transition-all';

  let isSearchOpen = $state(false);
  const menuLinks = $derived(
    data.user
      ? [
          { label: 'Home', href: '/' },
          { label: 'Explore', href: '/explore' },
          { label: 'Profile', href: '/profile' },
          { label: 'Watched', href: '/watched' },
          { label: 'Watch Next', href: '/watch-next' },
          { label: 'About', href: '/about' },
          { label: 'Logout', href: '/logout' }
        ]
      : [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Login', href: '/login' }
        ]
  );

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-[100vh] flex flex-col">
<header class="fixed top-0 left-0 right-0 bg-black/75 backdrop-blur p-4 shadow-lg flex items-center justify-between z-1000">
	<a href="/" class="flex items-center gap-1">
		<img src={favicon} alt="Cinefilia" class="w-6 h-6" />
		<span class="text-white font-bold text-lg">Cinefilia</span>
	</a>
	<div class="flex gap-2 items">
		{#if $page.url.pathname !== '/'}
			<BackButton />
		{/if}
		<Menu links={menuLinks}/>
		<HeaderSearch onOpen={() => isSearchOpen = true} />
	</div>

</header>
<main class="pt-16 w-full grow overflow-x-hidden bg-gradient-to-br from-black via-slate-950 to-gray-900">

{@render children()}

<footer class="w-full flex justify-between items-center p-2 bg-black text-center text-sm mt-16">
	{#if data.session}
  <div class="text-center text-sm text-slate-600">
    Welcome back{data.user?.name ? `, ${data.user.name}` : ''}!
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
  <SearchOverlay 
  	watchedIds={data?.watched?.map(i => i.mediaId) || []} 
  	watchNextIds={data?.watchNext?.map(i => i.mediaId) || []} 
	onClose={() => isSearchOpen = false} />
{/if}
</div>
