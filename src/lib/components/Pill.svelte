<script lang="ts">
    type themeType = 'primary' | 'secondary' | 'danger' | 'monotone'
    interface PillProps {
        label: string,
        theme: themeType,
        invertColors?: boolean
        href?: string
        onclick?: ()=>void
    }
    const props: PillProps = $props();

    const baseClasses = `rounded-full px-2.5 py-0.5 text-xs font-light transition-colors saturation-75 disabled:opacity-50 disabled:saturation-50 ${props.onclick || props.href ? 'hover:brightness-110 cursor-pointer' : 'select-none'} `
    const themeClasses: Record<themeType, {'basic': string, 'inverted': string}> = {
        primary: {'basic': 'bg-primary/40 text-gray-400', 'inverted': 'bg-white/15 text-primary-600'},
        secondary: {'basic': 'bg-secondary/30 text-gray-400', 'inverted': 'bg-white/15 text-secondary'},
        danger: {'basic': 'bg-danger/25 text-gray-400', 'inverted': 'bg-white/15 text-danger'},
        monotone: {'basic': 'bg-gray-700/10 text-gray-400', 'inverted': 'bg-white/15 text-gray-700'},
    }
    let effectiveClass = $derived(baseClasses+themeClasses[props.theme][props.invertColors ? 'inverted' : 'basic'])

</script>

{#if props.href}
<a class={effectiveClass} href="{props.href}">{props.label}</a>
{:else if props.onclick}
<button class={effectiveClass} onclick={props.onclick}>{props.label}</button>
{:else}
<span class={effectiveClass} >{props.label}</span>
{/if}