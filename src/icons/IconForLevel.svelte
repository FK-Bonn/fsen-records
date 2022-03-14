<script type="ts">
    import {AnnotationLevel} from "../Interfaces";
    import Checkmark from "./Checkmark.svelte";
    import Questionmark from "./Questionmark.svelte";
    import Info from "./Info.svelte";
    import Warning from "./Warning.svelte";
    import Cross from "./Cross.svelte";

    export let level: AnnotationLevel;
</script>

{#if level === AnnotationLevel.Ok}
    <Checkmark/>
{:else if level === AnnotationLevel.Unchecked}
    <Questionmark/>
{:else if level === AnnotationLevel.Info}
    <Info/>
{:else if level === AnnotationLevel.Warning}
    <Warning/>
{:else if level === AnnotationLevel.Error}
    <Cross/>
{:else}
    ?
{/if}