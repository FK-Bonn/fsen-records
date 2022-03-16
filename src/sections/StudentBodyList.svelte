<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import StudentBody from "./StudentBody.svelte";
    import {onMount} from 'svelte';

    export let studentBodies: Map<string, IStudentBody>
    export let timestamp: number
    $: lastUpdate = new Date(timestamp * 1000).toLocaleString();

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
        Letzte Aktualisierung: {lastUpdate}
    </div>
</div>

<ul>
    {#each [...studentBodies] as [key, studentBody]}
        <StudentBody {studentBody}/>
    {/each}
</ul>