<script type="ts">
    import type {IData} from "../Interfaces";
    import {AnnotationLevel} from "../Interfaces";
    import StudentBody from "./StudentBody.svelte";
    import {onMount} from 'svelte';
    import Legend from "../components/Legend.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";

    export let data: IData
    $: lastUpdate = new Date(data.timestamp * 1000).toLocaleString();
    $: lastUpdateLevel = (Date.now() / 1000 - data.timestamp) > 3600 ? AnnotationLevel.Warning : AnnotationLevel.Ok;

    const scrollToHashIfPresent = () => {
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView();
            }
        }
    }
    onMount(() => {
        scrollToHashIfPresent();
    });
</script>

<div class="message is-info">
    <div class="message-body">
        <p class="is-pulled-right">Letzte Aktualisierung: <IconForLevel level={lastUpdateLevel}/> {lastUpdate}</p>

        <Legend/>
    </div>
</div>

<ul>
    {#each [...data.studentBodies] as [key, studentBody] (key)}
        <StudentBody {studentBody} payoutRequests={data.payoutRequests.get(key)}/>
    {/each}
</ul>