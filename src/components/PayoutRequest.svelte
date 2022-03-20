<script type="ts">
    import type {IPayoutRequestData} from "../Interfaces";
    import {euro} from "../util";

    export let payoutRequest: IPayoutRequestData
    $: tagClass = getTagClass(payoutRequest);

    const getTagClass = (payoutRequest: IPayoutRequestData): string => {
        if (!payoutRequest) {
            return '';
        }
        const status = payoutRequest.status;
        if (['ÜBERWIESEN', 'ANGEWIESEN'].includes(status)) {
            return 'is-light';
        }
        if (status === 'VOLLSTÄNDIG') {
            return 'is-success';
        }
        if (status === 'IN BEARBEITUNG') {
            return 'is-info';
        }
        if (status === 'GESTELLT') {
            return 'is-dark';
        }
        return 'is-danger';
    }
</script>
{#if payoutRequest}
    <div class="tags card-header-icon">
        <span class="tag {tagClass}">{payoutRequest.status}</span>
        <span class="tag is-light"><b>{payoutRequest.id}</b></span>
        <span class="tag is-light">{euro(payoutRequest.amount)}</span>
    </div>
{/if}

<style>
    .tags {
        margin-bottom: 0;
    }

    .tag {
        margin-bottom: 0;
    }
</style>