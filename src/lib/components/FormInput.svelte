<script lang="ts">
	export let id: string;
	export let label: string;
	export let type: string = 'text';
	export let value: string = '';
	export let placeholder: string = '';
	export let disabled: boolean = false;
	export let required: boolean = false;
</script>

<div class="flex flex-col gap-2">
	<label for={id} class="font-semibold text-white text-sm">{label}</label>
	<input
		{id}
        name={id}
		{type}
		bind:value
		{placeholder}
		{required}
		{disabled}
		class="px-3 py-2 text-white border border-gray-300 rounded transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
	/>
</div>
