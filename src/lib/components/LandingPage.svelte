<script lang="ts">
	import BasicCard from './BasicCard.svelte';
	import HorizontalScrollContainer from './HorizontalScrollContainer.svelte';
	import NavButton from './NavButton.svelte';
	import MovePosterDisplay from './MovePosterDisplay.svelte';
	import SectionEyebrow from './SectionEyebrow.svelte';

	const samplePopularMovies = [
		{ mediaId: 603, title: 'The Matrix', posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', rating: 8.2 },
		{ mediaId: 155, title: 'The Dark Knight', posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rating: 8.5 },
		{ mediaId: 550, title: 'Fight Club', posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rating: 8.4 },
		{ mediaId: 680, title: 'Pulp Fiction', posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', rating: 8.5 },
		{ mediaId: 13, title: 'Forrest Gump', posterPath: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', rating: 8.5 },
		{ mediaId: 27205, title: 'Inception', posterPath: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', rating: 8.4 },
		{ mediaId: 278, title: 'The Shawshank Redemption', posterPath: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg', rating: 8.7 },
		{ mediaId: 157336, title: 'Interstellar', posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rating: 8.4 }
	];

	const featureCards = [
		{
			eyebrow: 'Track',
			title: 'Build your movie history without clutter.',
			text: 'Keep a clean log of what you watched, what you rated, and what still deserves a night on the big screen.'
		},
		{
			eyebrow: 'Recommend',
			title: 'Share picks with context.',
			text: 'Pass along films to friends, keep incoming recommendations organized, and stop losing great suggestions to group chats.'
		},
		{
			eyebrow: 'Explore',
			title: 'Browse a real movie catalog.',
			text: 'Search TMDB-powered results, jump into details fast, and move from curiosity to watchlist in a few clicks.'
		}
	];

	const quickStats = [
		{ value: 'Track', label: 'what you watch' },
		{ value: 'Rate', label: 'what you love' },
		{ value: 'Share', label: 'with anyone' }
	];
</script>

<div class="relative overflow-hidden">
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(111,28,183,0.22),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(46,162,212,0.14),transparent_30%),linear-gradient(180deg,rgba(10,10,10,0.96),rgba(0,0,0,1))]"></div>
	<div class="absolute inset-x-0 top-0 h-px bg-gradient-primary-secondary opacity-70"></div>

	<section class="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
		<div class="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
			<div class="max-w-2xl">
				<SectionEyebrow text="Your personal cinema" textClass="mb-6" />

				<h1 class="mb-5 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
					Movies that<br>
					<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary">
						stay with you.
					</span>
				</h1>

				<p class="mb-8 max-w-xl text-base leading-relaxed font-light text-slate-300 sm:text-lg">
					Log what you watched, save what comes next, and revisit the films that shaped your taste.
					Cinefilia keeps the interface quiet so the movies stay loud.
				</p>

				<div class="flex flex-wrap items-center gap-4">
					<NavButton type="primary" path="/login">Start Tracking</NavButton>
					<a
						href="/about"
						class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 transition-colors hover:text-white"
					>
						Learn more
						<span aria-hidden="true">→</span>
					</a>
				</div>
			</div>

			<BasicCard cardClass="max-w-none overflow-hidden p-0">
				<div class="border-b border-white/10 px-5 py-4 sm:px-6">
					<div class="flex items-center justify-between gap-4">
						<div>
							<h2 class="mt-2 text-xl font-semibold text-white sm:text-2xl">Explore, rate, track your favorites</h2>
						</div>
					</div>
				</div>

				<HorizontalScrollContainer
					snapMode="proximity"
					outerClass="px-4 pb-5 pt-4 sm:px-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent"
					innerClass="gap-4"
				>
					{#each samplePopularMovies as item (item.mediaId)}
						<div class="rounded-xl border border-white/8 bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.06]">
							<MovePosterDisplay {item} showRatings={true} />
						</div>
					{/each}
				</HorizontalScrollContainer>
			</BasicCard>
		</div>

		<div class="grid gap-4 sm:grid-cols-3">
			{#each quickStats as stat}
				<BasicCard cardClass="max-w-none p-5">
					<div class="text-2xl font-semibold text-secondary">{stat.value}</div>
					<p class="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
				</BasicCard>
			{/each}
		</div>
	</section>
</div>

<section class="relative overflow-hidden border-t border-white/10 bg-black px-6 py-20 sm:px-12 lg:px-20">
	<div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0)),radial-gradient(circle_at_20%_0%,rgba(111,28,183,0.08),transparent_30%),radial-gradient(circle_at_80%_100%,rgba(46,162,212,0.06),transparent_32%)] pointer-events-none"></div>
	<div class="mx-auto max-w-7xl">
		<div class="relative z-10 mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div class="max-w-xl">
				<SectionEyebrow text="What you get" textClass="mb-4" lineWidthClass="w-6" />
				<h2 class="text-3xl font-semibold leading-tight text-white sm:text-4xl">
					Everything a cinephile needs.
				</h2>
			</div>
			<p class="max-w-md text-sm leading-relaxed font-light text-slate-400">
				Clean, focused tools to build your personal film history without clutter, noise, or algorithmic filler.
			</p>
		</div>

		<div class="relative z-10 grid gap-4 lg:grid-cols-3">
			{#each featureCards as feature}
				<BasicCard cardClass="max-w-none p-6 sm:p-7">
					<p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">{feature.eyebrow}</p>
					<h3 class="mt-4 text-xl font-medium leading-snug text-white">{feature.title}</h3>
					<p class="mt-3 text-sm leading-relaxed font-light text-slate-400">{feature.text}</p>
				</BasicCard>
			{/each}
		</div>
	</div>
</section>

<section class="relative overflow-hidden border-t border-white/10 px-6 py-24 text-center sm:px-12 lg:px-20">
	<!-- <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0)),radial-gradient(ellipse_at_top,rgba(111,28,183,0.1),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(46,162,212,0.08),transparent_35%)] pointer-events-none"></div> -->
	<div class="relative z-10 mx-auto max-w-3xl">
		<SectionEyebrow text="Ready?" textClass="mb-6" showLine={false} align="center" />
		<h2 class="text-3xl font-semibold leading-tight text-white sm:text-4xl">
			Start building your
			<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary">
				film archive.
			</span>
		</h2>
		<p class="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-slate-400">
			Free to use, designed around movies, and ready whenever your watchlist gets longer than your weekend.
		</p>
		<div class="mt-10 flex justify-center">
			<NavButton type="primary" path="/login">Create Free Account</NavButton>
		</div>
	</div>
</section>
