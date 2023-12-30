<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import CurrentlyCanBePaidContent from "./CurrentlyCanBePaidContent.svelte";
    import AngleIndicator from "../icons/AngleIndicator.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import {CurrentlyCanBePaidCalculator} from "../Calculator";

    const calculateLevel = (studentBody: IStudentBody, fixedDate: string | null) => {
        const calculator = new CurrentlyCanBePaidCalculator(studentBody, fixedDate);
        return calculator.calculateOverallLevel();
    }

    export let studentBody: IStudentBody;
    export let fixedDate: string | null;
    $: level = calculateLevel(studentBody, fixedDate);
    let opened: boolean = false;

    const toggle = () => {
        opened = !opened;
    }
</script>

<div class="card">
    <header class="card-header" on:click={toggle}>
        <p class="card-header-title">
            <IconForLevel level={level}/> Auszahlungsfähigkeit
        </p>
        <button class="card-header-icon" aria-label="more options">
            <AngleIndicator {opened}/>
        </button>
    </header>
    {#if opened}
        <CurrentlyCanBePaidContent {studentBody} {fixedDate}/>
    {/if}
</div>

<style>
    .card-header {
        cursor: pointer;
    }
</style>