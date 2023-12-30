<script type="ts">
    import type {INewPayoutRequestData} from "../Interfaces";
    import PayoutRequestRow from "./PayoutRequestRow.svelte";

    export let bfsgPayoutRequests: INewPayoutRequestData[]
    export let singleFS: boolean = false;
    export let type: string;
    export let budgetTitlesBfsg: { [semester: string]: string } = {};
</script>

<table class="table is-narrow">
    <thead>
    <tr>
        <th>Antragsnummer</th>
        {#if !singleFS}
            <th>Fachschaft</th>
        {/if}
        <th>Kategorie</th>
        <th>Semester</th>
        <th>Betrag</th>
        <th>Status</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
    {#each bfsgPayoutRequests as payoutRequest (payoutRequest.request_id)}
        <PayoutRequestRow {singleFS} {payoutRequest} {type} {budgetTitlesBfsg}/>
    {/each}
    </tbody>
</table>
