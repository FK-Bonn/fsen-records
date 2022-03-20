<script type="ts">
    import StudentBody from "./StudentBody.svelte";
    import type {IPayoutRequestData, IStudentBody} from "../Interfaces";
    import {AnnotationLevel} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator} from "../Calculator";
    import {showOnlyWhoCurrentlyCanBePaid} from "../stores";

    export let payoutRequests: Map<string, IPayoutRequestData> | undefined;
    export let studentBody: IStudentBody;
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody);
    $: show = !$showOnlyWhoCurrentlyCanBePaid || !(AnnotationLevel.Error === calculator.calculateOverallLevel());
</script>

{#if show}
    <StudentBody {studentBody} {payoutRequests}/>
{/if}