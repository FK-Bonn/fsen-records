<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import CurrentlyCanBePaidContent from "./CurrentlyCanBePaidContent.svelte";
    import AngleIndicator from "../icons/AngleIndicator.svelte";
    import DocumentsList from "./DocumentsList.svelte";
    import {Interval, SemesterCalculator} from "../Calculator";
    import DateRange from "../components/DateRange.svelte";
    import SemesterContent from "./SemesterContent.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import {INewPayoutRequestData, IPayoutRequestData} from "../Interfaces";
    import PayoutRequest from "../components/PayoutRequest.svelte";
    import AttentionStar from "../components/AttentionStar.svelte";
    import {showOnlySemestersWithPayoutRequests, showOnlySemestersWithStar} from "../stores";
    import {calculateSemesterId, calculateSemesterName, shouldDisplayStar} from "../util";
    import DeadlineIcon from "../components/DeadlineIcon.svelte";

    const calculateLevel = (studentBody: IStudentBody, semester: Interval) => {
        const calculator = new SemesterCalculator(studentBody, semester);
        return calculator.calculateOverallLevel();
    }


    export let studentBody: IStudentBody;
    export let budgetTitles: { [semester: string]: string };
    export let semester: Interval;
    $: level = calculateLevel(studentBody, semester);
    $: semesterName = calculateSemesterName(semester);
    $: semesterId = calculateSemesterId(semester);
    export let payoutRequests: Map<string, INewPayoutRequestData> | undefined;
    $: payoutRequest = payoutRequests ? payoutRequests.get(semesterId) : null;
    $: budgetTitle = budgetTitles ? budgetTitles[semesterId] : '';
    $: displayStar = shouldDisplayStar(level, payoutRequest);
    let opened: boolean = false;

    const toggle = () => {
        opened = !opened;
    }
</script>

{#if (!$showOnlySemestersWithPayoutRequests && !$showOnlySemestersWithStar)
|| (displayStar)
|| (!$showOnlySemestersWithStar && $showOnlySemestersWithPayoutRequests && payoutRequest)}
<div class="card">
    <header class="card-header" on:click={toggle}>
        <p class="card-header-title">
            <IconForLevel level={level}/>
            {semesterName}
            (<DateRange interval={semester}/>)
            <DeadlineIcon  interval={semester}/>
        </p>
        <AttentionStar display={displayStar}/>
        <PayoutRequest {payoutRequest} fsName={studentBody.name} fsId={studentBody.id} {budgetTitle} {semester}/>
        <button class="card-header-icon" aria-label="more options">
            <AngleIndicator {opened}/>
        </button>
    </header>
    {#if opened}
        <SemesterContent {studentBody} {semester}/>
    {/if}
</div>
{/if}

<style>
    .card-header {
        cursor: pointer;
    }
</style>