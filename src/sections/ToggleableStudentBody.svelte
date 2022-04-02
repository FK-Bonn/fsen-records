<script type="ts">
    import StudentBody from "./StudentBody.svelte";
    import type {IPayoutRequestData, IStudentBody} from "../Interfaces";
    import {AnnotationLevel} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator} from "../Calculator";
    import {compactMode, showOnlyWhoCurrentlyCanBePaid} from "../stores";
    import CompactStudentBody from "./CompactStudentBody.svelte";

    export let payoutRequests: Map<string, IPayoutRequestData> | undefined;
    export let studentBody: IStudentBody;
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody);
    $: show = !$showOnlyWhoCurrentlyCanBePaid || !(AnnotationLevel.Error === calculator.calculateOverallLevel());
</script>

{#if show}
    {#if $compactMode}
        <CompactStudentBody {studentBody}/>
    {:else}
        <StudentBody {studentBody} {payoutRequests}/>
    {/if}
{/if}