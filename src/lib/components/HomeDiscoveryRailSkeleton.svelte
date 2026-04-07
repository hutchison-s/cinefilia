<script lang="ts">
	const props = $props<{
		title: string;
		subtitle?: string;
		cardCount?: number;
	}>();

	const cardCount = $derived(props.cardCount ?? 8);
	const cards = $derived(Array.from({ length: cardCount }, (_, index) => index));
</script>

<section class="mt-6">
	<div class="border-y border-primary bg-gradient-to-br via-transparent to-primary/50 py-2">
		<div class="mx-auto flex max-w-md flex-col items-center gap-2 px-4 text-center">
			<div class="h-5 w-52 rounded-full bg-slate-100/10 pulse-bar"></div>
			{#if props.subtitle}
				<div class="h-3 w-40 rounded-full bg-slate-100/6 pulse-bar pulse-bar-soft"></div>
			{/if}
		</div>
	</div>

	<div class="relative overflow-hidden px-4 sm:px-6 lg:px-8">
		<div class="pointer-events-none absolute inset-0 shimmer-wave"></div>
		<div class="flex gap-4 overflow-hidden py-4">
			{#each cards as card}
				<div
					class="poster-shell flex w-36 shrink-0 flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/80 p-2"
					style={`animation-delay: ${card * 120}ms;`}
				>
					<div class="poster-art aspect-[2/3] rounded-xl"></div>
					<div class="space-y-2 px-1 pb-1">
						<div class="h-3 w-full rounded-full bg-slate-100/10 pulse-bar"></div>
						<div class="h-3 w-3/5 rounded-full bg-slate-100/8 pulse-bar pulse-bar-soft"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.poster-shell {
		animation: posterPulse 2.8s ease-in-out infinite;
		box-shadow:
			0 0 0 1px rgba(148, 163, 184, 0.04),
			0 20px 40px rgba(15, 23, 42, 0.3);
	}

	.poster-art {
		background:
			radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.18), transparent 38%),
			radial-gradient(circle at 80% 30%, rgba(244, 114, 182, 0.14), transparent 36%),
			linear-gradient(140deg, rgba(71, 85, 105, 0.7), rgba(15, 23, 42, 0.45));
		position: relative;
		overflow: hidden;
	}

	.poster-art::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			115deg,
			transparent 0%,
			rgba(255, 255, 255, 0.04) 30%,
			rgba(255, 255, 255, 0.18) 48%,
			transparent 62%
		);
		transform: translateX(-100%);
		animation: posterSweep 2.4s ease-in-out infinite;
	}

	.pulse-bar {
		animation: barPulse 2s ease-in-out infinite;
	}

	.pulse-bar-soft {
		animation-delay: 180ms;
	}

	.shimmer-wave {
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(56, 189, 248, 0.04) 25%,
			rgba(244, 114, 182, 0.08) 50%,
			rgba(250, 204, 21, 0.04) 75%,
			transparent 100%
		);
		transform: translateX(-100%);
		animation: railSweep 3.2s ease-in-out infinite;
	}

	@keyframes posterPulse {
		0%,
		100% {
			transform: translateY(0);
			border-color: rgba(51, 65, 85, 0.6);
		}

		50% {
			transform: translateY(-4px);
			border-color: rgba(125, 211, 252, 0.28);
		}
	}

	@keyframes posterSweep {
		0% {
			transform: translateX(-130%);
		}

		55%,
		100% {
			transform: translateX(130%);
		}
	}

	@keyframes barPulse {
		0%,
		100% {
			opacity: 0.45;
		}

		50% {
			opacity: 0.95;
		}
	}

	@keyframes railSweep {
		0% {
			transform: translateX(-100%);
			opacity: 0;
		}

		20% {
			opacity: 1;
		}

		80% {
			opacity: 1;
		}

		100% {
			transform: translateX(100%);
			opacity: 0;
		}
	}
</style>
