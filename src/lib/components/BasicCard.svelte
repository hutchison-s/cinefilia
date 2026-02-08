<script lang="ts">
    const props = $props<{
        title?: string;
        cardClass?: string;
        onClick?: () => void;
        children?: ()=> any;
    }>();
</script>

{#if props.onClick}
<button onclick={props.onClick} class="border border-white/10 rounded-xl shadow-lg bg-white/5 backdrop-blur-lg max-w-lg {props.cardClass}">
    {#if props.title}
        <h1 class="text-center mb-8 text-gray-200 text-2xl font-bold">{props.title}</h1>
    {/if}
    {@render props.children?.()}
</button>
{:else}
<div class="border border-white/10 rounded-xl shadow-lg bg-white/5 backdrop-blur-lg max-w-lg {props.cardClass}">
    {#if props.title}
        <h1 class="text-center mb-8 text-gray-200 text-2xl font-bold">{props.title}</h1>
    {/if}
    {@render props.children?.()}
</div>
{/if}