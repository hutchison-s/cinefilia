<script lang="ts">
    import { goto } from '$app/navigation';
    import BaseButton from './BaseButton.svelte';

    export let btnClass: string = '';
    export let type: 'primary' | 'secondary' | 'danger' = 'primary';
    export let fullWidth: boolean = false;
    export let path: string | undefined = undefined;
    export let disabled: boolean = false;

    async function handleClick() {
        if (!path || disabled) return;
        await goto(path);
    }

</script>

<BaseButton {type} {btnClass} {fullWidth} disabled={disabled || !path} on:click={handleClick}>
    <slot></slot>
</BaseButton>