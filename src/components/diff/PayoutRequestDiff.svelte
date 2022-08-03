<script type="ts">
    import type {IPayoutRequestData} from "../../Interfaces";
    import {euro} from "../../util";

    export let before: IPayoutRequestData | null | undefined;
    export let after: IPayoutRequestData | null | undefined;
    $: idClass = (before && after) && (before.id !== after.id) ? 'is-warning' : '';
    $: statusClass = (before && after) && (before.status !== after.status) ? 'is-warning' : '';
    $: amountClass = (before && after) && (before.amount !== after.amount) ? 'is-warning' : '';
</script>

<td>
    {#if before}
        <ul>
            <li>ID: <span class="tag {idClass}">{before.id}</span></li>
            <li>Status: <span class="tag {statusClass}">{before.status}</span></li>
            <li>Betrag: <span class="tag {amountClass}">{euro(before.amount)}</span></li>
        </ul>
    {:else }
        -nix-
    {/if}
</td>
<td>
    {#if after}
        <ul>
            <li>ID: <span class="tag {idClass}">{after.id}</span></li>
            <li>Status: <span class="tag {statusClass}">{after.status}</span></li>
            <li>Betrag: <span class="tag {amountClass}">{euro(after.amount)}</span></li>
        </ul>
    {:else }
        -nix-
    {/if}
</td>
