<script type="ts">
    import type {IPayoutRequestData, IStudentBody} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval} from "../Calculator";
    import DateRange from "../components/DateRange.svelte";
    import CurrentlyCanBePaidSection from "./CurrentlyCanBePaidSection.svelte";
    import DocumentsSection from "./DocumentsSection.svelte";
    import SemesterSection from "./SemesterSection.svelte";
    import People from "../icons/People.svelte";
    import Warning from "../icons/Warning.svelte";
    import {semesters} from "../settings";

    export let payoutRequests: Map<string, IPayoutRequestData> | undefined;
    export let studentBody: IStudentBody;
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody);
</script>

<li>
    <div class="box">
        <h2 class="title is-2" id="{studentBody.id}">
            <a href="#{studentBody.id}"><People/></a>
            {studentBody.name}
        </h2>

        <p class="box"><a href="{studentBody.statutes}">Fachschaftssatzung</a>
            · Beginn des Haushaltsjahrs: {studentBody.financialYearStart}<br/>
            Aktuelles Haushaltsjahr:
            <DateRange interval={calculator.getCurrentFinancialYear()}/>
            {#if calculator.getCurrentFinancialYear().end < new Date()}
                <Warning/>
            {/if}
            <br/>
            Vergangenes Haushaltsjahr:
            <DateRange interval={calculator.getPreviousFinancialYear()}/>
        </p>

        <CurrentlyCanBePaidSection {studentBody}/>

        {#each semesters as semester}
            <SemesterSection {semester} {studentBody} {payoutRequests}/>
        {/each}

        <DocumentsSection {studentBody}/>

    </div>
</li>

<style>
    .box {
        margin-bottom: 1rem;
    }
</style>