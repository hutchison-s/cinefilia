<script lang="ts">
    export let title: string | undefined = undefined;
    export let cardClass: string = '';
</script>

<div class="p-8 px-12 border border-white/10 rounded-xl shadow-lg bg-white/5 backdrop-blur-md max-w-lg mx-auto mt-10 {cardClass}">
    {#if title}
        <h1 class="text-center mb-8 text-gray-200 text-2xl font-bold">{title}</h1>
    {/if}
    <slot></slot>
</div>
