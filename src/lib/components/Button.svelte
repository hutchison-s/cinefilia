<script lang="ts">
    import BaseButton from './BaseButton.svelte';

    export let btnClass: string = '';
    export let type: 'primary' | 'secondary' | 'danger' = 'primary';
    export let disabled: boolean = false;
    export let fullWidth: boolean = false;
    export let buttonType: 'button' | 'submit' | 'reset' = 'button';
</script>

<BaseButton {type} {btnClass} {disabled} {fullWidth} {buttonType} on:click>
    <slot></slot>
</BaseButton>