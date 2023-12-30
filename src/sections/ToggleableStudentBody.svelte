<script type="ts">
    import StudentBody from "./StudentBody.svelte";
    import type {INewPayoutRequestData, IStudentBody} from "../Interfaces";
    import {AnnotationLevel} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval, SemesterCalculator} from "../Calculator";
    import {
        afsgPayoutRequestData,
        bfsgPayoutRequestData,
        compactMode,
        showOnlySemestersWithStar,
        showOnlyWhoCurrentlyCanBePaid,
        vorankuendigungPayoutRequestData
    } from "../stores";
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
    export let budgetTitlesBfsg: { [semester: string]: string };
    export let semesters: Interval[];
    export let fixedDate: string | null;
    export let studentBody: IStudentBody;
    $: payoutRequests = $afsgPayoutRequestData ? $afsgPayoutRequestData.get(studentBody.id) : undefined
    $: bfsgPayoutRequests = $bfsgPayoutRequestData ? $bfsgPayoutRequestData.get(studentBody.id) : undefined
    $: vorankuendigungPayoutRequests = $vorankuendigungPayoutRequestData ? $vorankuendigungPayoutRequestData.get(studentBody.id) : undefined
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody, fixedDate);
    $: show = shouldShow($showOnlyWhoCurrentlyCanBePaid, $showOnlySemestersWithStar, studentBody, calculator, payoutRequests, semesters);
</script>

{#if show}
    {#if $compactMode}
        <CompactStudentBody {studentBody} {semesters} {fixedDate}/>
    {:else}
        <StudentBody {studentBody} {payoutRequests} {bfsgPayoutRequests} {vorankuendigungPayoutRequests}
                     {semesters} {budgetTitles} {budgetTitlesBfsg} {fixedDate}/>
    {/if}
{/if}