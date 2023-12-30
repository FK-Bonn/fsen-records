<script type="ts">
    import {INewPayoutRequestData} from "../../Interfaces";
    import {euroCents} from "../../util";

    export let before: INewPayoutRequestData | null | undefined;
    export let after: INewPayoutRequestData | null | undefined;
    $: idClass = (before && after) && (before.request_id !== after.request_id) ? 'is-warning' : '';
    $: categoryClass = (before && after) && (before.category !== after.category) ? 'is-warning' : '';
    $: statusClass = (before && after) && (before.status !== after.status) ? 'is-warning' : '';
    $: amountClass = (before && after) && (before.amount_cents !== after.amount_cents) ? 'is-warning' : '';
    $: dateClass = (before && after) && (before.request_date !== after.request_date) ? 'is-warning' : '';
    $: deadlineClass = (before && after) && (before.completion_deadline !== after.completion_deadline) ? 'is-warning' : '';
    $: commentClass = (before && after) && (before.comment !== after.comment) ? 'is-warning' : '';
    $: referenceClass = (before && after) && (before.reference !== after.reference) ? 'is-warning' : '';
</script>

<td>
    {#if before}
        <ul>
            <li>ID: <span class="tag {idClass}">{before.request_id}</span></li>
            <li>Kategorie: <span class="tag {categoryClass}">{before.category}</span></li>
            <li>Status: <span class="tag {statusClass}">{before.status}</span></li>
            <li>Betrag: <span class="tag {amountClass}">{euroCents(before.amount_cents)}</span></li>
            <li>Antragsdatum: <span class="tag {dateClass}">{before.request_date}</span></li>
            <li>Deadline: <span class="tag {deadlineClass}">{before.completion_deadline}</span></li>
            <li>Kommentar: <span class="tag {commentClass}">{before.comment}</span></li>
            <li>Referenz: <span class="tag {referenceClass}">{before.reference}</span></li>
        </ul>
    {:else }
        -nix-
    {/if}
</td>
<td>
    {#if after}
        <ul>
            <li>ID: <span class="tag {idClass}">{after.request_id}</span></li>
            <li>Kategorie: <span class="tag {categoryClass}">{after.category}</span></li>
            <li>Status: <span class="tag {statusClass}">{after.status}</span></li>
            <li>Betrag: <span class="tag {amountClass}">{euroCents(after.amount_cents)}</span></li>
            <li>Antragsdatum: <span class="tag {dateClass}">{after.request_date}</span></li>
            <li>Deadline: <span class="tag {deadlineClass}">{after.completion_deadline}</span></li>
            <li>Kommentar: <span class="tag {commentClass}">{after.comment}</span></li>
            <li>Referenz: <span class="tag {referenceClass}">{after.reference}</span></li>
        </ul>
    {:else }
        -nix-
    {/if}
</td>
