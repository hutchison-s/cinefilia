<script lang="ts">
    const props = $props<{
        snapMode?: 'mandatory' | 'proximity';
        outerClass?: string;
        innerClass?: string;
        children?: import('svelte').Snippet;
    }>();

    const snapModeClass = $derived(
        props.snapMode === 'proximity' ? 'snap-proximity' : 'snap-mandatory'
    );
</script>

<div class={`p-2 py-6 w-full overflow-y-hidden overflow-x-auto snap-x ${snapModeClass} ${props.outerClass ?? ''}`}>
    <div class={`flex space-x-2 w-fit ${props.innerClass ?? ''}`}>
        {@render props.children?.()}
    </div>
</div>
