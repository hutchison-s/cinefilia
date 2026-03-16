<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/icon.png';
	import HeaderSearch from '$lib/components/HeaderSearch.svelte';
	import SearchOverlay from '$lib/components/SearchOverlay.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Menu from '$lib/components/Menu.svelte';

  const { data, children } = $props();

  let isSearchOpen = $state(false);
	let showBackButton = $state(false);
	const HISTORY_FLAG_KEY = 'cinefilia_has_internal_history';
	const menuLinks = $derived(
		data.user
		? [
			{ label: 'Home', href: '/' },
			{ label: 'Watched', href: '/watched' },
			{ label: 'Watch Next', href: '/watch-next' },
			{ label: 'Connections', href: '/connections' },
			{ label: 'Explore', href: '/explore' },
			{ label: 'Profile', href: '/profile' },
			{ label: 'About', href: '/about' },
			{ label: 'Logout', href: '/logout' }
			]
		: [
			{ label: 'Home', href: '/' },
			{ label: 'About', href: '/about' },
			{ label: 'Login', href: '/login' }
			]
	);

	onMount(() => {
		let cameFromSameOrigin = false;
		if (document.referrer) {
			try {
				cameFromSameOrigin = new URL(document.referrer).origin === window.location.origin;
			} catch {
				cameFromSameOrigin = false;
			}
		}

		const hasInternalHistory = sessionStorage.getItem(HISTORY_FLAG_KEY) === '1';
		showBackButton = cameFromSameOrigin || hasInternalHistory;

		return afterNavigate((navigation) => {
			if (navigation.from && navigation.from.url.pathname !== navigation.to?.url.pathname) {
				showBackButton = true;
				sessionStorage.setItem(HISTORY_FLAG_KEY, '1');
			}
		});
	});

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-[100vh] flex flex-col">
<header class="fixed top-0 left-0 right-0 bg-black/75 backdrop-blur p-4 shadow-lg flex items-center justify-between z-1000">
	<a href="/" class="flex items-center gap-1">
		<img src={favicon} alt="Cinefilia" class="w-6 h-6" />
		<span class="text-white font-bold text-lg">Cinefilia</span>
	</a>
	<div class="flex gap-2 items">
		{#if $page.url.pathname !== '/' && showBackButton}
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
  	connectionCounts={data?.connectionCounts || {}}
	onClose={() => isSearchOpen = false} />
{/if}
</div>
