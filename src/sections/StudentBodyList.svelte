<script type="ts">
    import type {IData} from "../Interfaces";
    import {AnnotationLevel, INewPayoutRequestData} from "../Interfaces";
    import {onMount} from 'svelte';
    import Legend from "../components/Legend.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import Filters from "../components/Filters.svelte";
    import ToggleableStudentBody from "./ToggleableStudentBody.svelte";
    import {Interval} from "../Calculator";
    import {scrollToHashIfPresent} from "../util";
    import {payoutRequestData} from "../stores";

    export let data: IData;
    export let fixedDate: string | null;
    $: lastUpdate = new Date(data.timestamp * 1000).toLocaleString();
    $: lastUpdateLevel = (Date.now() / 1000 - data.timestamp) > 3600 ? AnnotationLevel.Warning : AnnotationLevel.Ok;
    $: semesters = data.semesters.map(value => Interval.fromStrings(value.start, value.end))

    onMount(() => {
        scrollToHashIfPresent();
    });
</script>

<div class="message is-info">
    <div class="message-body">
        <p class="is-pulled-right">Letzte Aktualisierung: <IconForLevel level={lastUpdateLevel}/> {lastUpdate}</p>

        <Legend/>
        <Filters/>
    </div>
</div>

<ul>
    {#each [...data.studentBodies] as [key, studentBody] (key)}
        <ToggleableStudentBody {studentBody}
                               {semesters}
                               budgetTitles={data.budgetTitles}
                               {fixedDate}/>
    {/each}
</ul>