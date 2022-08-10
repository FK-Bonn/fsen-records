<script type="ts">
    import type {IPayoutRequestData} from "../Interfaces";
    import {euro} from "../util";
    import CopyableTag from "./CopyableTag.svelte";

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

    const getTableLine = (payoutRequest: IPayoutRequestData, fsName: string, budgetTitle: string): string => {
        if (!payoutRequest) {
            return '';
        }
        return [
            budgetTitle,
            fsName,
            payoutRequest.id,
            payoutRequest.requestDate,
            euro(payoutRequest.amount),
            'IBAN',
        ].join('\t')
    }

    export let fsName: string = '';
    export let budgetTitle: string;
    export let payoutRequest: IPayoutRequestData;
    $: tagClass = getTagClass(payoutRequest);
    $: tableLine = getTableLine(payoutRequest, fsName, budgetTitle);
</script>
{#if payoutRequest}
    <div class="tags card-header-icon">
        <CopyableTag tagClass={tagClass} text={payoutRequest.status} copyText="{tableLine}"/>
        <CopyableTag text={payoutRequest.id}/>
        <CopyableTag text={euro(payoutRequest.amount)} bold={true}/>
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