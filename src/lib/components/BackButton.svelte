<script lang="ts">
	import { ArrowLeft } from "lucide-svelte";
	import BaseButton from "./BaseButton.svelte";

    let props = $props<{ buttonClass?: string }>();

</script>
<BaseButton
    btnClass={`flex items-center gap-2 ${props.buttonClass || ''}`}
    type="back"
    on:click={() => history.back()}>
    <ArrowLeft strokeWidth={1.5} />
</BaseButton>