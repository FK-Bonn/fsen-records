<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval, SemesterCalculator} from "../Calculator";
    import DateRange from "../components/DateRange.svelte";
    import Checkmark from "../icons/Checkmark.svelte";
    import Questionmark from "../icons/Questionmark.svelte";
    import Cross from "../icons/Cross.svelte";
    import SingleDocument from "../components/SingleDocument.svelte";
    import SingleDocumentWithoutReferences from "../components/SingleDocumentWithoutReferences.svelte";

    export let studentBody: IStudentBody;
    export let semester: Interval;
    $: calculator = new SemesterCalculator(studentBody, semester);
    $: mostRecentElection = calculator.getMostRecentElection();
</script>


<div class="card-content">
    <div class="content">
        <dl>
            <dt>Haushaltspläne</dt>
            <dd>
                {#each calculator.getRelevantBudgets() as budget}
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

            <dt>Haushaltsrechnungen</dt>
            <dd>
                <ul>
                {#each calculator.getRelevantBalances() as balance}
                    <li><SingleDocument document={balance}/></li>
                {:else}
                    <li>Fehlt! <Cross/></li>
                {/each}
                </ul>
            </dd>

            <dt>Kassenprüfungen</dt>
            <dd>
                {#each calculator.getRelevantCashAudits() as cashAudit}
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

            <dt>Wahlergebnis</dt>
            <dd>
                {#if mostRecentElection}
                    <SingleDocument document={mostRecentElection}/>
                {:else}
                    Fehlt!
                    <Cross/>
                {/if}
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
