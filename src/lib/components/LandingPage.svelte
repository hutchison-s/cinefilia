<script>
	import NavButton from './NavButton.svelte';
</script>

<!-- Hero Section -->
<div class="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">

	<!-- Poster mosaic background -->
	<div class="absolute inset-0 grid grid-cols-7 grid-rows-3 gap-px opacity-15 scale-105 -skew-x-1 pointer-events-none">
		{#each Array(21) as _, i}
			<div class="bg-gradient-to-br {[
				'from-purple-950 to-purple-900',
				'from-slate-900 to-blue-950',
				'from-purple-900 to-indigo-950',
				'from-slate-950 to-purple-950',
				'from-indigo-950 to-slate-900',
				'from-purple-950 to-slate-950',
				'from-blue-950 to-purple-900',
			][i % 7]} relative">
				<div class="absolute inset-2 border border-white/5 rounded-sm"></div>
			</div>
		{/each}
	</div>

	<!-- Radial overlay -->
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.8)_55%,rgba(0,0,0,0.98)_100%)]"></div>

	<!-- Gradient accent glow -->
	<div class="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
	<div class="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none"></div>

	<!-- Content -->
	<div class="relative z-10 px-6 sm:px-12 lg:px-20 max-w-4xl">

		<p class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-primary mb-8 font-medium">
			<span class="block w-8 h-px bg-primary"></span>
			Your personal cinema
		</p>

		<h1 class="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-tight mb-4 tracking-tight">
			Movies that<br>
			<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary">
				stay with you.
			</span>
		</h1>

		<p class="text-slate-400 text-lg leading-relaxed mb-10 max-w-md font-light">
			Track what you watch, rate what you love,
			and recommend films to friends —
			<span class="italic text-slate-300">or enemies</span>.
		</p>

		<div class="flex items-center gap-6 flex-wrap">
			<NavButton type="primary" path="/login">
				Start Tracking
			</NavButton>
			<a href="/about" class="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
				Learn more
				<span class="group-hover:translate-x-1 transition-transform">→</span>
			</a>
		</div>
	</div>

	<!-- Bottom stats bar -->
	<div class="absolute bottom-10 left-6 sm:left-12 lg:left-20 right-6 z-10 flex items-center gap-10 flex-wrap">
		<div>
			<div class="text-2xl font-semibold text-secondary">Track</div>
			<div class="text-xs uppercase tracking-widest text-slate-500 mt-0.5">What you watch</div>
		</div>
		<div class="w-px h-8 bg-slate-700/60"></div>
		<div>
			<div class="text-2xl font-semibold text-secondary">Rate</div>
			<div class="text-xs uppercase tracking-widest text-slate-500 mt-0.5">What you love</div>
		</div>
		<div class="w-px h-8 bg-slate-700/60"></div>
		<div>
			<div class="text-2xl font-semibold text-secondary">Share</div>
			<div class="text-xs uppercase tracking-widest text-slate-500 mt-0.5">With anyone</div>
		</div>
	</div>
</div>

<!-- Features Section -->
<div class="bg-zinc-950 border-t border-slate-800/60 px-6 sm:px-12 lg:px-20 py-24">

	<div class="flex flex-col lg:flex-row justify-between items-start gap-8 mb-16">
		<div>
			<p class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-primary mb-4 font-medium">
				<span class="block w-6 h-px bg-primary"></span>
				What you get
			</p>
			<h2 class="text-3xl sm:text-4xl font-semibold text-white leading-snug max-w-sm">
				Everything a cinephile needs.
			</h2>
		</div>
		<p class="text-slate-400 text-sm leading-relaxed max-w-sm lg:pt-10 font-light">
			Clean, focused tools to build your personal film history — no noise, no algorithm, no bloat.
		</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-800/30">
		{#each [
			{ icon: '🎬', title: 'Track & Log', text: 'Mark films as watched, build a queue, and keep a living diary of your cinema life.' },
			{ icon: '★', title: 'Rate & Review', text: 'Score every film on your own scale. Your ratings, your taste — no algorithm needed.' },
			{ icon: '↗', title: 'Recommend', text: 'Share picks with people you trust — or want to challenge. Context always included.' },
			{ icon: '⌕', title: 'Search & Discover', text: 'Find any film instantly via TMDB\'s vast database. Dive into directors, eras, genres.' },
			{ icon: '◉', title: 'Sort & Curate', text: 'Organise by year, genre, rating, or director. Your archive, your way.' },
			{ icon: '◷', title: 'What\'s Next', text: 'Never lose a recommendation again. Your watchlist keeps every film you\'ve meant to see.' },
		] as feature}
			<div class="bg-zinc-950 p-10 group hover:bg-zinc-900 transition-colors relative overflow-hidden">
				<div class="absolute top-0 left-0 right-0 h-px bg-gradient-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
				<span class="block text-2xl mb-6 opacity-70">{feature.icon}</span>
				<h3 class="text-white font-medium mb-3">{feature.title}</h3>
				<p class="text-slate-400 text-sm leading-relaxed font-light">{feature.text}</p>
			</div>
		{/each}
	</div>
</div>

<!-- CTA Section -->
<div class="bg-black border-t border-slate-800/60 px-6 sm:px-12 lg:px-20 py-24 text-center relative overflow-hidden">
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(111,28,183,0.08)_0%,transparent_70%)] pointer-events-none"></div>
	<div class="relative z-10">
		<p class="text-xs uppercase tracking-[0.2em] text-primary mb-6 font-medium">Ready?</p>
		<h2 class="text-3xl sm:text-4xl font-semibold text-white mb-4 leading-snug">
			Your cinema life,<br>
			<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary">
				properly documented.
			</span>
		</h2>
		<p class="text-slate-500 text-sm mb-10 font-light">Free to use. No ads. Just films.</p>
		<NavButton type="primary" path="/login">
			Create Free Account
		</NavButton>
	</div>
</div>
