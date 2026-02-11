<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import BasicCard from '$lib/components/BasicCard.svelte';
	import FormInput from '$lib/components/FormInput.svelte';

	export let form;

	let isNewUser = false;

	function toggleForm() {
		isNewUser = !isNewUser;
	}
</script>

<BasicCard title={isNewUser ? 'Sign Up' : 'Login'}
  cardClass="p-6 w-full max-w-md mx-auto mt-12">
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
			<div class="bg-red-50 text-red-700 p-3 rounded text-sm border-l-4 border-red-700">
				{form.error}
			</div>
		{/if}

		<Button
			type="primary"
			buttonType="submit"
			fullWidth
		>
			{isNewUser ? 'Sign Up' : 'Login'}
		</Button>
	</form>

	<p class="text-center mt-4 text-gray-600 text-sm">
		{isNewUser ? 'Already have an account?' : "Don't have an account?"}
		<button
			type="button"
			on:click={toggleForm}
			class="ml-1 text-indigo-500 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
		>
			{isNewUser ? 'Log in' : 'Sign up'}
		</button>
	</p>
</BasicCard>
