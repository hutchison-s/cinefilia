<script lang="ts">
	import BasicCard from '$lib/components/BasicCard.svelte';
	import NavButton from '$lib/components/NavButton.svelte';
	import SectionEyebrow from '$lib/components/SectionEyebrow.svelte';

	const corePillars = [
		{
			number: '01',
			title: 'Organise your history',
			text: 'Sort and search your watched films with a clean, focused interface. Filter by genre, year, director, or your own ratings to navigate your collection with ease.',
			tone: 'text-secondary'
		},
		{
			number: '02',
			title: 'Never lose a recommendation',
			text: 'Add films to your watchlist the moment someone mentions them. Your queue is always searchable, so no great tip ever slips through the cracks.',
			tone: 'text-secondary'
		},
		{
			number: '03',
			title: 'Recommend through your network',
			text: 'Share recommendations directly on the site, connect to friends, and browse their lists to see what they are watching, saving, and loving lately.',
			tone: 'text-secondary'
		}
	];

	const philosophyItems = [
		{
			title: 'No algorithm. No noise.',
			text: 'We do not push recommendations at you or clutter your view with trending content. Cinefilia is a quiet space for your own taste to develop, uninfluenced.'
		},
		{
			title: 'Your ratings belong to you.',
			text: 'There is no social score here. Your ratings are your own record, a private calibration of what cinema means to you, not a performance for an audience.'
		},
		{
			title: 'Clean by design.',
			text: 'Every feature earns its place. We believe the best tool for a cinephile is one that gets out of the way and lets the films be the focus.'
		},
		{
			title: 'Powered by TMDB.',
			text: 'Film data comes from The Movie Database, a community-maintained resource covering hundreds of thousands of titles.'
		}
	];
</script>

<svelte:head>
	<title>About - Cinefilia</title>
</svelte:head>

<div class="relative overflow-hidden">
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(111,28,183,0.22),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(46,162,212,0.14),transparent_30%),linear-gradient(180deg,rgba(10,10,10,0.96),rgba(0,0,0,1))]"></div>
	<div class="absolute inset-x-0 top-0 h-px bg-gradient-primary-secondary opacity-70"></div>

	<section class="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
		<div class="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
			<div class="max-w-3xl">
				<SectionEyebrow text="About Cinefilia" textClass="mb-6" />
				<h1 class="mb-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
					Built for people who take
					<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary">
						films seriously.
					</span>
				</h1>
				<p class="max-w-2xl text-base font-light leading-relaxed text-slate-300 sm:text-lg">
					Cinefilia is a personal movie tracking app for the kind of viewer who cannot just say
					"it was good." It is a place to keep a true record of what you have watched, what you
					thought, and what you are hungry to see next.
				</p>
				<div class="mt-8 flex flex-wrap items-center gap-4">
					<NavButton type="primary" path="/login">Create Free Account</NavButton>
					<a
						href="/"
						class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 transition-colors hover:text-white"
					>
						Back home
						<span aria-hidden="true">→</span>
					</a>
				</div>
			</div>

			<BasicCard cardClass="max-w-none p-6 sm:p-7">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">What it is for</p>
				<h2 class="mt-4 text-2xl font-semibold leading-snug text-white">
					A calm place to keep your movie life in order.
				</h2>
				<p class="mt-4 text-sm font-light leading-relaxed text-slate-400">
					Track what you watched, remember what mattered, and build a film archive that reflects your
					taste instead of someone else's feed.
				</p>
				<div class="mt-6 grid gap-3 sm:grid-cols-2">
					<div class="rounded-xl border border-white/8 bg-white/[0.03] p-4">
						<div class="text-lg font-semibold text-secondary">Private taste</div>
						<p class="mt-2 text-sm font-light leading-relaxed text-slate-400">Your ratings and watch history stay centered on your own perspective.</p>
					</div>
					<div class="rounded-xl border border-white/8 bg-white/[0.03] p-4">
						<div class="text-lg font-semibold text-secondary">Focused tools</div>
						<p class="mt-2 text-sm font-light leading-relaxed text-slate-400">Search, logging, and watchlists without extra clutter competing for attention.</p>
					</div>
				</div>
			</BasicCard>
		</div>
	</section>
</div>

<section class="relative overflow-hidden border-t border-white/10 px-6 py-20 sm:px-12 lg:px-20">
	<!-- <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0)),radial-gradient(circle_at_20%_0%,rgba(111,28,183,0.08),transparent_30%),radial-gradient(circle_at_80%_100%,rgba(46,162,212,0.06),transparent_32%)] pointer-events-none"></div> -->
	<div class="relative z-10 mx-auto max-w-7xl">
		<div class="mb-10 max-w-xl">
			<SectionEyebrow text="Core ideas" textClass="mb-4" lineWidthClass="w-6" />
			<h2 class="text-3xl font-semibold leading-tight text-white sm:text-4xl">
				Simple tools for serious viewers.
			</h2>
		</div>

		<div class="grid gap-4 lg:grid-cols-3">
			{#each corePillars as item}
				<BasicCard cardClass="max-w-none p-6 sm:p-8">
					<div class={`mb-6 text-5xl font-semibold italic tracking-tight ${item.tone}`}>{item.number}</div>
					<h3 class="text-xl font-medium text-white">{item.title}</h3>
					<p class="mt-4 text-sm font-light leading-relaxed text-slate-400">{item.text}</p>
				</BasicCard>
			{/each}
		</div>
	</div>
</section>

<section class="relative overflow-hidden border-t border-white/10 bg-black px-6 py-24 sm:px-12 lg:px-20">
	<div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0)),radial-gradient(circle_at_75%_10%,rgba(111,28,183,0.08),transparent_30%)] pointer-events-none"></div>
	<div class="relative z-10 mx-auto max-w-7xl grid gap-10 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
		<div class="self-start lg:sticky lg:top-24">
			<SectionEyebrow text="Our philosophy" textClass="mb-4" lineWidthClass="w-6" />
			<h2 class="text-2xl font-semibold leading-snug text-white sm:text-3xl">
				Designed to stay out of the way of the films.
			</h2>
		</div>

		<div class="grid gap-4">
			{#each philosophyItems as item}
				<BasicCard cardClass="max-w-none p-6 sm:p-7">
					<h3 class="flex items-center gap-3 text-base font-medium text-white">
						<span class="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
						{item.title}
					</h3>
					<p class="mt-3 pl-4 text-sm font-light leading-relaxed text-slate-400">{item.text}</p>
				</BasicCard>
			{/each}
		</div>
	</div>
</section>

<section class="relative overflow-hidden border-t border-white/10 px-6 py-16 sm:px-12 lg:px-20">
	<!-- <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0)),radial-gradient(circle_at_15%_50%,rgba(46,162,212,0.08),transparent_28%)] pointer-events-none"></div> -->
	<div class="relative z-10 mx-auto max-w-5xl">
		<BasicCard cardClass="max-w-none p-6 sm:p-8">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-start gap-4">
					<div class="flex-shrink-0 rounded-lg bg-[#01d277] px-5 py-3 text-sm font-bold tracking-wide text-black">
						TMDB
					</div>
					<p class="max-w-2xl text-sm font-light leading-relaxed text-slate-400">
						This product uses the
						<a
							href="https://www.themoviedb.org/"
							target="_blank"
							rel="noopener noreferrer"
							class="text-secondary transition-colors hover:text-white"
						>
							TMDB API
						</a>
						but is not endorsed or certified by TMDB. All film metadata and information are sourced from The Movie Database community.
					</p>
				</div>
			</div>
		</BasicCard>
	</div>
</section>

<section class="relative overflow-hidden px-6 py-24 text-center sm:px-12 lg:px-20">
	<div class="relative z-10 mx-auto max-w-3xl">
		<SectionEyebrow text="Join us" textClass="mb-6" showLine={false} align="center" />
		<h2 class="text-3xl font-semibold leading-tight text-white sm:text-4xl">
			Start building your
			<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary">
				film archive.
			</span>
		</h2>
		<p class="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-slate-400">
			Free to use. Always focused on movies.
		</p>
		<div class="mt-10 flex justify-center">
			<NavButton type="primary" path="/login">Create Free Account</NavButton>
		</div>
	</div>
</section>
