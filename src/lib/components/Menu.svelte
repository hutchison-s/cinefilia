<script lang="ts">
	import { page } from '$app/stores';
	import { Menu, XIcon } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	type NavLink = {
		label: string;
		href: string;
	};

	let {links} = $props<{
		links: NavLink[];
	}>();

	let open = $state(false);

	const toggle = () => (open = !open);
	const close = () => (open = false);
</script>

<!-- Desktop list -->
<div class="hidden md:flex items-center gap-6">
	{#each links as link}
		<a
			href={link.href}
			class="text-sm font-medium text-gray-400 hover:text-secondary"
			class:underline={$page.url.pathname === link.href}
		>
			{link.label}
		</a>
	{/each}
</div>

<!-- Mobile hamburger -->
<button
	class="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-black"
	aria-label="Toggle navigation"
	aria-expanded={open}
	onclick={toggle}
>
		{#if open}
			<XIcon />
		{:else}
			<Menu />
		{/if}
</button>

<!-- Mobile menu -->
{#if open}
	<div
	class="md:hidden absolute left-0 top-full w-screen min-h-[90vh]
	       bg-black/95 backdrop-blur shadow-lg
	       transition-opacity duration-200 z-50
	       opacity-0"
	class:opacity-100={open}
	transition:fade={{ duration: 200 }}
	style="
		mask-image: linear-gradient(
			to bottom,
			rgba(0,0,0,1) 0%,
			rgba(0,0,0,1) 60%,
			rgba(0,0,0,0) 100%
		);
		-webkit-mask-image: linear-gradient(
			to bottom,
			rgba(0,0,0,1) 0%,
			rgba(0,0,0,1) 60%,
			rgba(0,0,0,0) 100%
		);
	"
>
		<ul class="flex flex-col py-1">
			{#each links as link}
				<li>
					<a
						href={link.href}
						class="block px-4 py-2 text-lg font-light text-gray-200 hover:text-white"
						onclick={close}
					>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>

{/if}