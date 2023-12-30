<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import SingleDocument from "../components/SingleDocument.svelte";

    export let studentBody: IStudentBody;
</script>


<div class="card-content">
    <div class="content">
        <h3 class="heading is-3">Haushaltspläne</h3>
        <ul>
            {#each studentBody.budgets as budget}
                <li><SingleDocument document="{budget}" {studentBody}/></li>
            {:else}
                Keine vorhanden.
            {/each}
        </ul>
        <h3 class="heading is-3">Haushaltsrechnungen</h3>
        <ul>
            {#each studentBody.balances as balance}
                <li><SingleDocument document="{balance}" {studentBody}/></li>
            {:else}
                Keine vorhanden.
            {/each}
        </ul>
        <h3 class="heading is-3">Kassenprüfungen</h3>
        <ul>
            {#each studentBody.cashAudits as cashAudit}
                <li><SingleDocument document="{cashAudit}" {studentBody}/></li>
            {:else}
                Keine vorhanden.
            {/each}
        </ul>
        <h3 class="heading is-3">Protokolle</h3>
        <ul>
            {#each studentBody.proceedings as proceeding}
                <li><SingleDocument document="{proceeding}" {studentBody}/></li>
            {:else}
                <li>Keine vorhanden.</li>
            {/each}
        </ul>
        <h3 class="heading is-3">Wahlergebnisse</h3>
        <ul>
            {#each studentBody.electionResults as electionResult}
                <li><SingleDocument document="{electionResult}" {studentBody}/></li>
            {:else}
                <li>Keine vorhanden.</li>
            {/each}
        </ul>
    </div>
</div>

<style>
    li {
        list-style: none;
    }
</style>
