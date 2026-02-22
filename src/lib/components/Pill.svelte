<script lang="ts">
    type themeType = 'primary' | 'secondary' | 'danger' | 'monotone'
    type pillSize = 'sm' | 'md' | 'lg' | 'xl'

    interface PillProps {
    label: string
    theme: themeType
    invertColors?: boolean
    size?: pillSize
    href?: string
    onclick?: () => void
    }

    const props: PillProps = $props();

    const baseClasses = `
    rounded-full
    font-light
    backdrop-blur-sm
    transition-colors
    saturation-60
    disabled:opacity-50
    disabled:saturation-50
    ${props.onclick || props.href ? 'hover:brightness-110 cursor-pointer' : 'select-none'}
    `;

    const sizeClasses: Record<pillSize, string> = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
    xl: 'px-5 py-2 text-lg'
    };

    const themeClasses: Record<themeType, { basic: string; inverted: string }> = {
    primary: {
        basic: 'bg-primary/30 text-gray-400',
        inverted: 'bg-white/15 text-primary-600'
    },
    secondary: {
        basic: 'bg-secondary/25 text-gray-400',
        inverted: 'bg-white/15 text-secondary'
    },
    danger: {
        basic: 'bg-danger/25 text-gray-400',
        inverted: 'bg-white/15 text-danger'
    },
    monotone: {
        basic: 'bg-gray-700/10 text-gray-400',
        inverted: 'bg-white/15 text-gray-700'
    }
    };

    const size = $derived(props.size ?? 'sm');

    let effectiveClass = $derived(
        [
            baseClasses,
            sizeClasses[size],
            themeClasses[props.theme][props.invertColors ? 'inverted' : 'basic']
        ].join(' ')
    );

</script>

{#if props.href}
<a class={effectiveClass} href="{props.href}">{props.label}</a>
{:else if props.onclick}
<button class={effectiveClass} onclick={props.onclick}>{props.label}</button>
{:else}
<span class={effectiveClass} >{props.label}</span>
{/if}