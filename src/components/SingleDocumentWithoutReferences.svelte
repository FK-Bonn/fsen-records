<script type="ts">
    import type {IAnnotatedDocument} from "../Interfaces";
    import Checkmark from "../icons/Checkmark.svelte";
    import Questionmark from "../icons/Questionmark.svelte";
    import {Interval, VerdictCalculator} from "../Calculator";
    import {AnnotationLevel} from "../Interfaces";
    import Cross from "../icons/Cross.svelte";
    import Warning from "../icons/Warning.svelte";
    import Info from "../icons/Info.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import DateRange from "./DateRange.svelte";

    export let document: IAnnotatedDocument;
</script>

{#if document.checked}
    <IconForLevel level={VerdictCalculator.getWorstAnnotationLevel(document.annotations)}/>
{:else}
    <Questionmark/>
{/if}
<code>{document.filename}</code>
(<DateRange interval={Interval.fromStrings(document.dateStart, document.dateEnd || document.dateStart)}/>)
<ul>
    {#each document.annotations as annotation}
        <li>
            <IconForLevel level={annotation.level}/>
            {annotation.text}
        </li>
    {/each}
</ul>

<style>
    ul {
        margin-top: 0;
        list-style: none !important;
    }
</style>