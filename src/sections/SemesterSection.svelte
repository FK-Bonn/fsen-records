<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import CurrentlyCanBePaidContent from "./CurrentlyCanBePaidContent.svelte";
    import AngleIndicator from "../icons/AngleIndicator.svelte";
    import DocumentsList from "./DocumentsList.svelte";
    import {Interval, SemesterCalculator} from "../Calculator";
    import DateRange from "../components/DateRange.svelte";
    import SemesterContent from "./SemesterContent.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import {IPayoutRequestData} from "../Interfaces";
    import PayoutRequest from "../components/PayoutRequest.svelte";
    import AttentionStar from "../components/AttentionStar.svelte";

    const calculateLevel = (studentBody: IStudentBody, semester: Interval) => {
        const calculator = new SemesterCalculator(studentBody, semester);
        return calculator.calculateOverallLevel();
    }

    const calculateSemesterName = (interval?: Interval) => {
        if (!interval) {
            return '?';
        }
        if (interval.start.getFullYear() === interval.end.getFullYear()) {
            return 'Sommersemester ' + interval.start.getFullYear();
        } else {
            return 'Wintersemester ' + interval.start.getFullYear() + '/' + interval.end.getFullYear().toString().substring(2, 4);
        }
    }

    const calculateSemesterId = (interval?: Interval) => {
        if (!interval) {
            return undefined;
        }
        if (interval.start.getFullYear() === interval.end.getFullYear()) {
            return '' + interval.start.getFullYear() + '-SoSe';
        } else {
            return '' + interval.start.getFullYear() + '-WiSe';
        }
    }

    export let studentBody: IStudentBody;
    export let semester: Interval;
    $: level = calculateLevel(studentBody, semester);
    $: semesterName = calculateSemesterName(semester);
    $: semesterId = calculateSemesterId(semester);
    export let payoutRequests: Map<string, IPayoutRequestData> | undefined;
    $: payoutRequest = payoutRequests ? payoutRequests.get(semesterId) : null;
    let opened: boolean = false;

    const toggle = () => {
        opened = !opened;
    }
</script>

<div class="card">
    <header class="card-header" on:click={toggle}>
        <p class="card-header-title">
            <IconForLevel level={level}/> {semesterName} (<DateRange interval={semester}/>)
        </p>
        <AttentionStar {level} {payoutRequest}/>
        <PayoutRequest {payoutRequest}/>
        <button class="card-header-icon" aria-label="more options">
            <AngleIndicator {opened}/>
        </button>
    </header>
    {#if opened}
        <SemesterContent {studentBody} {semester}/>
    {/if}
</div>

<style>
    .card-header {
        cursor: pointer;
    }
</style>