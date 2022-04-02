<script type="ts">
    import {AnnotationLevel} from "../Interfaces";
    import Checkmark from "./Checkmark.svelte";
    import Questionmark from "./Questionmark.svelte";
    import Info from "./Info.svelte";
    import Warning from "./Warning.svelte";
    import Cross from "./Cross.svelte";

    export let level: AnnotationLevel;
    export let title: string = '';
</script>

{#if level === AnnotationLevel.Ok}
    <Checkmark {title}/>
{:else if level === AnnotationLevel.Unchecked}
    <Questionmark {title}/>
{:else if level === AnnotationLevel.Info}
    <Info {title}/>
{:else if level === AnnotationLevel.Warning}
    <Warning {title}/>
{:else if level === AnnotationLevel.Error}
    <Cross {title}/>
{:else}
    ?
{/if}