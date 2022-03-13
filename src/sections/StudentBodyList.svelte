<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import StudentBody from "./StudentBody.svelte";
    import {onMount} from 'svelte';

    export let studentBodies: Map<string, IStudentBody>

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

<ul>
    {#each [...studentBodies] as [key, studentBody]}
        <StudentBody {studentBody}/>
    {/each}
</ul>