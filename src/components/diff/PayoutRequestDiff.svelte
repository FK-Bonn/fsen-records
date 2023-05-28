<script type="ts">
    import type {IPayoutRequestData} from "../../Interfaces";
    import {euro, euroCents} from "../../util";
    import {INewPayoutRequestData} from "../../Interfaces";

    export let before: INewPayoutRequestData | null | undefined;
    export let after: INewPayoutRequestData | null | undefined;
    $: idClass = (before && after) && (before.request_id !== after.request_id) ? 'is-warning' : '';
    $: statusClass = (before && after) && (before.status !== after.status) ? 'is-warning' : '';
    $: amountClass = (before && after) && (before.amount_cents !== after.amount_cents) ? 'is-warning' : '';
    $: dateClass = (before && after) && (before.request_date !== after.request_date) ? 'is-warning' : '';
</script>

<td>
    {#if before}
        <ul>
            <li>ID: <span class="tag {idClass}">{before.request_id}</span></li>
            <li>Status: <span class="tag {statusClass}">{before.status}</span></li>
            <li>Betrag: <span class="tag {amountClass}">{euroCents(before.amount_cents)}</span></li>
            <li>Antragsdatum: <span class="tag {dateClass}">{before.request_date}</span></li>
        </ul>
    {:else }
        -nix-
    {/if}
</td>
<td>
    {#if after}
        <ul>
            <li>ID: <span class="tag {idClass}">{after.request_id}</span></li>
            <li>Status: <span class="tag {statusClass}">{after.status}</span></li>
            <li>Betrag: <span class="tag {amountClass}">{euroCents(after.amount_cents)}</span></li>
            <li>Antragsdatum: <span class="tag {dateClass}">{after.request_date}</span></li>
        </ul>
    {:else }
        -nix-
    {/if}
</td>
