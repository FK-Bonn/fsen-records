<script type="ts">
    import StudentBody from "./StudentBody.svelte";
    import type {INewPayoutRequestData, IPayoutRequestData, IStudentBody} from "../Interfaces";
    import {AnnotationLevel} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval, SemesterCalculator} from "../Calculator";
    import {compactMode, payoutRequestData, showOnlySemestersWithStar, showOnlyWhoCurrentlyCanBePaid} from "../stores";
    import CompactStudentBody from "./CompactStudentBody.svelte";
    import {calculateSemesterId, shouldDisplayStar} from "../util";

    const anySemesterHasStar = (studentBody: IStudentBody, payoutRequests: Map<string, INewPayoutRequestData> | undefined, semesters: Interval[]) => {
        if (!studentBody || !payoutRequests || !semesters) {
            return false;
        }
        for (let semester of semesters) {
            const semesterId = calculateSemesterId(semester);
            const payoutRequest = payoutRequests.get(semesterId);
            if (payoutRequest) {
                const calculator = new SemesterCalculator(studentBody, semester)
                if (shouldDisplayStar(calculator.calculateOverallLevel(), payoutRequest)) {
                    return true;
                }
            }
        }
        return false;
    }

    const shouldShow = (showOnlyWhoCurrentlyCanBePaid: boolean, showOnlyWithStars: boolean, studentBody: IStudentBody, calculator: CurrentlyCanBePaidCalculator,
                        payoutRequests: Map<string, INewPayoutRequestData> | undefined, semesters: Interval[]) => {
        let show = true;
        if (showOnlyWhoCurrentlyCanBePaid) {
            show &= (AnnotationLevel.Error !== calculator.calculateOverallLevel());
        }
        if (showOnlyWithStars) {
            show &= anySemesterHasStar(studentBody, payoutRequests, semesters);
        }
        return show;
    }

    export let budgetTitles: { [semester: string]: string };
    export let semesters: Interval[];
    export let studentBody: IStudentBody;
    $: payoutRequests = $payoutRequestData ? $payoutRequestData.get(studentBody.id) : undefined
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody);
    $: show = shouldShow($showOnlyWhoCurrentlyCanBePaid, $showOnlySemestersWithStar, studentBody, calculator, payoutRequests, semesters);
</script>

{#if show}
    {#if $compactMode}
        <CompactStudentBody {studentBody} {semesters}/>
    {:else}
        <StudentBody {studentBody} {payoutRequests} {semesters} {budgetTitles}/>
    {/if}
{/if}