<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import CurrentlyCanBePaidContent from "./CurrentlyCanBePaidContent.svelte";
    import AngleIndicator from "../icons/AngleIndicator.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import {AnnotationLevel} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator} from "../Calculator";

    const calculateLevel = (studentBody: IStudentBody) => {
        const calculator = new CurrentlyCanBePaidCalculator(studentBody);
        return calculator.calculateOverallLevel();
    }

    export let studentBody: IStudentBody;
    $: level = calculateLevel(studentBody);
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
        <CurrentlyCanBePaidContent {studentBody}/>
    {/if}
</div>

<style>
    .card-header {
        cursor: pointer;
    }
</style>