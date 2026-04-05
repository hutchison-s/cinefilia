<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import BasicCard from '$lib/components/BasicCard.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import SectionEyebrow from '$lib/components/SectionEyebrow.svelte';

	import type { PageData } from './$types';

	const { data, form } = $props<{ data: PageData; form: import('./$types').ActionData }>();

	let isNewUser = $state(false);
	const pageTitle = $derived(
		data.isConnectionInviteRedirect
			? "Let's connect on Cinefilia"
			: data.isMovieRedirect
				? 'Movie Recommendation on Cinefilia'
				: `${isNewUser ? 'Sign Up' : 'Login'} - Cinefilia`
	);
	const pageDescription = $derived(
		data.isConnectionInviteRedirect
			? 'Log in to review and respond to your Cinefilia connection invite.'
			: data.isMovieRedirect
				? 'Log in to open this shared movie recommendation on Cinefilia.'
				: 'Log in to your Cinefilia account to keep tracking and sharing movies.'
	);

	const contextTitle = $derived(
		data.isConnectionInviteRedirect
			? 'Open your connection invite.'
			: data.isMovieRedirect
				? 'Open this movie recommendation.'
				: 'Pick up your movie life where you left it.'
	);

	const contextCopy = $derived(
		data.isConnectionInviteRedirect
			? 'Sign in to accept invites, connect your lists, and start seeing what your friends are watching.'
			: data.isMovieRedirect
				? 'Sign in to view the shared recommendation, save it for later, or add your own response.'
				: 'Log watched films, keep your queue in order, and share recommendations without losing the thread.'
	);

	const contextAccent = $derived(
		data.isConnectionInviteRedirect
			? 'connection invite.'
			: data.isMovieRedirect
				? 'movie recommendation.'
				: 'where you left it.'
	);

	function toggleForm() {
		isNewUser = !isNewUser;
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
</svelte:head>

<section class="mx-auto w-full max-w-7xl px-6 py-12 sm:px-12 lg:px-20 lg:py-20">
	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] lg:items-center">
		<div class="max-w-2xl">
			<SectionEyebrow
				text={data.isConnectionInviteRedirect
					? 'Connections'
					: data.isMovieRedirect
						? 'Recommendation'
						: 'Welcome back'}
				textClass="mb-6"
			/>

			<h1 class="mb-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
				{#if data.isConnectionInviteRedirect}
					Open your<br>
				{:else if data.isMovieRedirect}
					Open this<br>
				{:else}
					Pick up your movie life<br>
				{/if}
				<span class="italic font-light text-transparent bg-clip-text bg-gradient-primary-secondary">
					{contextAccent}
				</span>
			</h1>

			<p class="max-w-xl text-base font-light leading-relaxed text-slate-300 sm:text-lg">
				{contextCopy}
			</p>
		</div>

		<BasicCard cardClass="w-full max-w-none p-6 sm:p-8">
			<div class="mb-8">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">
					{isNewUser ? 'Create account' : 'Account access'}
				</p>
				<h2 class="mt-3 text-3xl font-semibold text-white">
					{isNewUser ? 'Sign up' : 'Login'}
				</h2>
				<p class="mt-3 text-sm font-light leading-relaxed text-slate-400">
					{isNewUser
						? 'Start tracking what you watch and build your archive.'
						: 'Sign in to continue tracking, rating, and sharing movies.'}
				</p>
			</div>

			<form
				method="POST"
				action={isNewUser ? '?/signup' : '?/login'}
				class="flex flex-col gap-6"
			>
				<FormInput
					id="email"
					label="Email"
					type="email"
					placeholder="Enter your email"
					required
				/>

				<FormInput
					id="password"
					label="Password"
					type="password"
					placeholder="Enter your password"
					required
				/>

				{#if isNewUser}
					<FormInput
						id="confirmPassword"
						label="Confirm Password"
						type="password"
						placeholder="Confirm your password"
						required
					/>

					<FormInput
						id="name"
						label="Name"
						type="text"
						placeholder="Enter your name (optional)"
					/>
				{/if}

				{#if form?.error}
					<div class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						{form.error}
					</div>
				{/if}

				<Button
					type="primary"
					buttonType="submit"
					fullWidth
					btnClass="py-2.5 text-base font-medium"
				>
					{isNewUser ? 'Sign Up' : 'Login'}
				</Button>
			</form>

			<div class="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
				{isNewUser ? 'Already have an account?' : "Don't have an account?"}
				<button
					type="button"
					onclick={toggleForm}
					class="ml-1 border-0 bg-transparent font-semibold text-secondary transition-colors hover:text-white"
				>
					{isNewUser ? 'Log in' : 'Sign up'}
				</button>
			</div>
		</BasicCard>
	</div>
</section>
