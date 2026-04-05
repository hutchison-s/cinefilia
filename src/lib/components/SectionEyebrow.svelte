<script lang="ts">
	export let text: string;
	export let showLine: boolean = true;
	export let lineWidthClass: string = 'w-6';
	export let textClass: string = '';
	export let align: 'left' | 'center' = 'left';

	const alignmentClass = align === 'center' ? 'justify-center text-center' : '';
</script>

<p class={`flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 ${alignmentClass} ${textClass}`.trim()}>
	{#if showLine}
		<span class={`block h-px bg-slate-400 ${lineWidthClass}`}></span>
	{/if}
	{text}
</p>
