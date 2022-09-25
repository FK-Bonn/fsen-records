<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval, SemesterCalculator, VerdictCalculator} from "../Calculator";
    import DateRange from "../components/DateRange.svelte";
    import Checkmark from "../icons/Checkmark.svelte";
    import Questionmark from "../icons/Questionmark.svelte";
    import Cross from "../icons/Cross.svelte";
    import SingleDocument from "../components/SingleDocument.svelte";
    import SingleDocumentWithoutReferences from "../components/SingleDocumentWithoutReferences.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import RelevantDocumentsWithProceedings from "../components/RelevantDocumentsWithProceedings.svelte";
    import {paleLowerDocuments} from "../stores";

    export let studentBody: IStudentBody;
    export let semester: Interval;
    $: calculator = new SemesterCalculator(studentBody, semester);
    $: mostRecentElection = calculator.getMostRecentElection();
</script>


<div class="card-content">
    <div class="content">
        <RelevantDocumentsWithProceedings
                title="Haushaltspläne"
                proceedingsTitle="Beschluss"
                overallLevel={calculator.getBudgetLevel()}
                documents={calculator.getRelevantBudgets()}
                covered={calculator.isSemesterCoveredByBudgets()}
                {studentBody}/>

        <h5 class="title is-5">
            <IconForLevel level={calculator.getBalanceLevel()}/>
            Haushaltsrechnungen
        </h5>
        <ul class="documents level-{calculator.getBalanceLevel()} {$paleLowerDocuments ? 'pale' : ''}">
            {#if calculator.getRelevantBalances().length > 0 && !calculator.isSemesterCoveredByBalances()}
                <li>
                    <Cross/>
                    Semester nicht vollständig abgedeckt
                </li>
            {/if}
            {#each calculator.getRelevantBalances() as balance}
                <li class="document level-{VerdictCalculator.getWorstAnnotationLevel(balance.annotations)}">
                    <SingleDocument document={balance} {studentBody}/>
                </li>
            {:else}
                <li>
                    <Cross/>
                    Fehlt!
                </li>
            {/each}
        </ul>

        <RelevantDocumentsWithProceedings
                title="Kassenprüfungen"
                proceedingsTitle="Wahl der Kassenprüfer*innen"
                overallLevel={calculator.getCashAuditLevel()}
                documents={calculator.getRelevantCashAudits()}
                covered={calculator.isSemesterCoveredByCashAudits()}
                {studentBody}/>

        <h5 class="title is-5">
            <IconForLevel level={calculator.getElectionLevel()}/>
            Wahlergebnis
        </h5>
        {#if mostRecentElection}
            <SingleDocument document={mostRecentElection} {studentBody}/>
        {:else}
            <Cross/>
            Fehlt!
        {/if}
    </div>
</div>

<style>
    h5.title {
        border-bottom: 1px solid #ccc;
        border-image: linear-gradient(90deg, #ccc, #fff) 1;
        padding-bottom: .2em;
        padding-top: .3em;
        margin: 0 0 .5em 0;
    }

    ul, ul:not(:last-child) {
        margin-top: 0;
        margin-left: 0;
        list-style: none !important;
    }

    .pale.documents.level-Ok .document.level-Warning,
    .pale.documents.level-Ok .document.level-Error,
    .pale.documents.level-Warning .document.level-Error {
        opacity: 0.3;
    }
</style>
