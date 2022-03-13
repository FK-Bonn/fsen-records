<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval} from "../Calculator";
    import DateRange from "../components/DateRange.svelte";
    import Checkmark from "../icons/Checkmark.svelte";
    import Questionmark from "../icons/Questionmark.svelte";
    import Cross from "../icons/Cross.svelte";
    import SingleDocument from "../components/SingleDocument.svelte";
    import SingleDocumentWithoutReferences from "../components/SingleDocumentWithoutReferences.svelte";

    export let studentBody: IStudentBody;
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody);
    $: mostRecentElection = calculator.getMostRecentElection();
    $: mostRecentInauguralMeetingProceedings = calculator.getProceedingsOfMostRecentInauguralMeeting();
</script>


<div class="card-content">
    <div class="content">
        <dl>
            <dt>Letzte Wahl</dt>
            <dd>
                {#if mostRecentElection}
                    <DateRange
                            interval={Interval.fromStrings(mostRecentElection.dateStart, mostRecentElection.dateEnd)}/>
                    {#if calculator.isMostRecentElectionYoungerThanOneYear()}
                        <Checkmark/>
                    {:else}
                        <Cross/>
                    {/if}
                {:else}
                    Fehlt!
                    <Cross/>
                {/if}
            </dd>
            <dt>Letzte konstituierende Sitzung</dt>
            <dd>
                {#if mostRecentInauguralMeetingProceedings}
                    <DateRange
                            interval={Interval.fromStrings(mostRecentInauguralMeetingProceedings.dateStart, mostRecentInauguralMeetingProceedings.dateStart)}/>
                    {#if mostRecentInauguralMeetingProceedings.checked}
                        <Checkmark/>
                    {:else}
                        <Questionmark/>
                    {/if}
                {:else}
                    Fehlt!
                    <Cross/>
                {/if}
            </dd>
            <dt>Aktueller Haushaltsplan</dt>
            <dd>
                {#each calculator.getRelevantBudgetsForCurrentFinancialYear() as budget}
                    <dl>
                        <dt>Dateiname</dt>
                        <dd>
                            <SingleDocumentWithoutReferences document={budget}/>
                        </dd>
                        <dt>beschlossen am</dt>
                        <dd>
                            {#each budget.resolvedReferences as reference}
                                <SingleDocument document={reference}/>
                            {:else}
                                ?
                            {/each}
                        </dd>

                    </dl>
                {:else}
                    Fehlt!
                    <Cross/>
                {/each}
            </dd>
            <dt>Haushaltsplan des vorherigen Haushaltsjahres</dt>
            <dd>
                {#each calculator.getRelevantBudgetsForPreviousFinancialYear() as budget}
                    <dl>
                        <dt>Dateiname</dt>
                        <dd>
                            <SingleDocumentWithoutReferences document={budget}/>
                        </dd>
                        <dt>beschlossen am</dt>
                        <dd>
                            {#each budget.resolvedReferences as reference}
                                <SingleDocument document={reference}/>
                            {:else}
                                ?
                            {/each}
                        </dd>

                    </dl>
                {:else}
                    Fehlt!
                    <Cross/>
                {/each}
            </dd>
            <dt>Haushaltsrechnung des vorherigen Haushaltsjahres</dt>
            <dd>
                <ul>
                    {#each calculator.getRelevantBalancesForPreviousFinancialYear() as balance}
                        <li>
                            <SingleDocument document={balance}/>
                        </li>
                    {:else}
                        <li>
                            Fehlt!
                            <Cross/>
                        </li>
                    {/each}
                </ul>
            </dd>
            <dt>Kassenprüfungen</dt>
            <dd>
                {#each calculator.getRelevantCashAuditsForPreviousFinancialYear() as cashAudit}
                    <dl>
                        <dt>Zeitraum</dt>
                        <dd>
                            <DateRange interval={Interval.fromStrings(cashAudit.dateStart, cashAudit.dateEnd)}/>
                            {#if cashAudit.checked}
                                <Checkmark/>
                            {:else}
                                <Questionmark/>
                            {/if}
                        </dd>
                        <dt>Wahl der Kassenprüfer*innen</dt>
                        <dd>
                            {#each cashAudit.resolvedReferences as reference}
                                <SingleDocument document={reference}/>
                            {:else}
                                ?
                            {/each}
                        </dd>
                    </dl>
                {:else}
                    Fehlt!
                    <Cross/>
                {/each}
            </dd>
        </dl>
    </div>
</div>

<style>
    ul {
        margin-top: 0;
    }

    dt {
        font-weight: bold;
    }

    .content dl dl:not(:last-child) {
        margin-bottom: .5em;
    }
</style>
