<svelte:head>
	<title>About - Cinefilia</title>
</svelte:head>

<!-- Hero -->
<div class="relative bg-black overflow-hidden">
	<div class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
	<div class="absolute top-20 right-20 w-64 h-64 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

	<div class="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pt-24 pb-20">
		<p class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-primary mb-6 font-medium">
			<span class="block w-8 h-px bg-primary"></span>
			About Cinefilia
		</p>
		<h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6 tracking-tight max-w-3xl">
			Built for people who take
			<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary"> films seriously.</span>
		</h1>
		<p class="text-slate-400 text-base leading-relaxed max-w-xl font-light">
			Cinefilia is a personal movie tracking app for the kind of viewer who can't just say "it was good."
			It's a place to keep a true record of what you've watched, what you thought, and what you're hungry to see next.
		</p>
	</div>
</div>

<!-- Two-panel feature split -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-800/30">
	<div class="bg-zinc-950 px-8 sm:px-12 py-16">
		<div class="text-4xl font-light text-primary/20 mb-6 italic">01</div>
		<h3 class="text-xl font-medium text-white mb-4">Organise your history</h3>
		<p class="text-slate-400 text-sm leading-relaxed font-light">
			Sort and search your watched films with a clean, focused interface.
			Filter by genre, year, director, or your own ratings to navigate
			your collection with ease.
		</p>
	</div>
	<div class="bg-zinc-950 px-8 sm:px-12 py-16">
		<div class="text-4xl font-light text-secondary/20 mb-6 italic">02</div>
		<h3 class="text-xl font-medium text-white mb-4">Never lose a recommendation</h3>
		<p class="text-slate-400 text-sm leading-relaxed font-light">
			Add films to your watchlist the moment someone mentions them.
			Your queue is always searchable, so no great tip ever slips through the cracks.
		</p>
	</div>
</div>

<!-- Philosophy -->
<div class="bg-black border-t border-slate-800/60 px-6 sm:px-12 lg:px-20 py-24">
	<div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">

		<div class="lg:sticky lg:top-24 self-start">
			<p class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-primary mb-4 font-medium">
				<span class="block w-6 h-px bg-primary"></span>
				Our philosophy
			</p>
			<h2 class="text-2xl sm:text-3xl font-semibold text-white leading-snug">
				Simple tools for serious viewers.
			</h2>
		</div>

		<div class="lg:col-span-2 divide-y divide-slate-800/60">
			{#each [
				{ title: 'No algorithm. No noise.', text: 'We don\'t push recommendations at you or clutter your view with trending content. Cinefilia is a quiet space for your own taste to develop, uninfluenced.' },
				{ title: 'Your ratings belong to you.', text: 'There\'s no social score here. Your ratings are your own record — a private calibration of what cinema means to you, not a performance for an audience.' },
				{ title: 'Clean by design.', text: 'Every feature earns its place. We believe the best tool for a cinephile is one that gets out of the way and lets the films be the focus.' },
				{ title: 'Powered by TMDB.', text: 'Film data comes from The Movie Database — a community-maintained resource covering hundreds of thousands of titles.' },
			] as item}
				<div class="py-10 group">
					<h4 class="flex items-center gap-3 text-white font-medium mb-3 text-base">
						<span class="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-secondary transition-colors flex-shrink-0"></span>
						{item.title}
					</h4>
					<p class="text-slate-400 text-sm leading-relaxed font-light pl-4">{item.text}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- TMDB credit -->
<div class="bg-zinc-950 border-t border-slate-800/60 px-6 sm:px-12 lg:px-20 py-16">
	<div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-8">
		<div class="flex-shrink-0 px-5 py-3 rounded bg-[#01d277] text-black font-bold text-sm tracking-wide">
			TMDB
		</div>
		<p class="text-slate-400 text-sm leading-relaxed font-light max-w-lg">
			This product uses the
			<a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer"
				class="text-secondary hover:underline">
				TMDB API
			</a>
			but is not endorsed or certified by TMDB. All film metadata and information
			are sourced from The Movie Database community.
		</p>
	</div>
</div>

<!-- CTA -->
<div class="bg-black border-t border-slate-800/60 px-6 sm:px-12 lg:px-20 py-24 text-center relative overflow-hidden">
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(111,28,183,0.08)_0%,transparent_70%)] pointer-events-none"></div>
	<div class="relative z-10">
		<p class="text-xs uppercase tracking-[0.2em] text-primary mb-6 font-medium">Join us</p>
		<h2 class="text-3xl sm:text-4xl font-semibold text-white mb-4 leading-snug">
			Start building your
			<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary"> film archive.</span>
		</h2>
		<p class="text-slate-500 text-sm mb-10 font-light">Free to use. Always.</p>
		<a href="/login"
			class="inline-block px-8 py-3 bg-gradient-primary text-white text-sm font-medium tracking-wide hover:opacity-90 transition-opacity rounded-sm">
			Create Free Account
		</a>
	</div>
</div>
