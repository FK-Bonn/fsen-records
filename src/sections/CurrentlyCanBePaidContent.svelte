<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval, VerdictCalculator} from "../Calculator";
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
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody);
    $: mostRecentElection = calculator.getMostRecentElection();
    $: mostRecentInauguralMeetingProceedings = calculator.getProceedingsOfMostRecentInauguralMeeting();
</script>


<div class="card-content">
    <div class="content">
        <h5 class="title is-5">
            <IconForLevel level={calculator.getElectionLevel()}/>
            Letzte Wahl
        </h5>
        {#if mostRecentElection}
            <ul>
                <li>
                    {#if calculator.isMostRecentElectionYoungerThanOneYear()}
                        <Checkmark/>
                        Innerhalb der letzten 12 Monate
                    {:else}
                        <Cross/>
                        Nicht innerhalb der letzten 12 Monate
                    {/if}
                </li>
                <li>
                    <SingleDocument document={mostRecentElection} {studentBody}/>
                </li>
            </ul>
        {:else}
            <Cross/>
            Fehlt!
        {/if}

        <h5 class="title is-5">
            <IconForLevel level={calculator.getProceedingsOfLastInauguralMeetingLevel()}/>
            Letzte konstituierende Sitzung
        </h5>
        {#if mostRecentInauguralMeetingProceedings}
            <ul>
                <li>
                    <IconForLevel
                            level={calculator.areProceedingsOfLastInauguralMeetingYoungerThanLastElectionLevel(mostRecentInauguralMeetingProceedings)}/>
                    <DateRange
                            interval={Interval.fromStrings(mostRecentInauguralMeetingProceedings.dateStart, mostRecentInauguralMeetingProceedings.dateStart)}/>
                    nach letzter Wahl?
                </li>
                <li>
                    <SingleDocument document={mostRecentInauguralMeetingProceedings} {studentBody}/>
                </li>
            </ul>
        {:else}
            <Cross/>
            Fehlt!
        {/if}

        <RelevantDocumentsWithProceedings
                title="Aktueller Haushaltsplan"
                proceedingsTitle="Beschluss"
                overallLevel={calculator.getCurrentFinancialYearBudgetLevel()}
                documents={calculator.getRelevantBudgetsForCurrentFinancialYear()}
                covered={calculator.isCurrentFinanicalYearCoveredByBudgets()}
                {studentBody}/>

        <RelevantDocumentsWithProceedings
                title="Haushaltsplan des vorherigen Haushaltsjahres"
                proceedingsTitle="Beschluss"
                overallLevel={calculator.getPreviousFinancialYearBudgetLevel()}
                documents={calculator.getRelevantBudgetsForPreviousFinancialYear()}
                covered={calculator.isPreviousFinanicalYearCoveredByBudgets()}
                {studentBody}/>

        <h5 class="title is-5">
            <IconForLevel level={calculator.getBalanceLevel()}/>
            Haushaltsrechnung des vorherigen Haushaltsjahres
        </h5>
        <ul class="documents level-{calculator.getBalanceLevel()} {$paleLowerDocuments ? 'pale' : ''}">
            {#each calculator.getRelevantBalancesForPreviousFinancialYear() as balance}
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
                documents={calculator.getRelevantCashAuditsForPreviousFinancialYear()}
                covered={calculator.isPreviousFinancialYearCoveredByCashAudits()}
                {studentBody}/>
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
