<script type="ts">
    import type {IAllFsData, INewPayoutRequestData} from "../Interfaces";
    import {euroCents} from "../util";
    import CopyableTag from "./CopyableTag.svelte";
    import {allFsData} from "../stores";

    const getTagClass = (payoutRequest: INewPayoutRequestData): string => {
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
        if (status === 'GESTELLT') {
            return 'is-dark';
        }
        return 'is-danger';
    }

    const getTableLine = (allData: IAllFsData, payoutRequest: INewPayoutRequestData, fsName: string, fsId: string, budgetTitle: string): string => {
        if (!payoutRequest) {
            return '';
        }
        let iban = 'IBAN';
        if (allData?.hasOwnProperty(fsId)) {
            const fsData = allData[fsId];
            if (fsData.protected_data) {
                iban = fsData.protected_data.iban;
            }
        }
        return [
            budgetTitle,
            fsName,
            payoutRequest.request_id,
            payoutRequest.request_date,
            euroCents(payoutRequest.amount_cents),
            iban,
        ].join('\t')
    }

    export let fsName: string = '';
    export let fsId: string = '';
    export let budgetTitle: string;
    export let payoutRequest: INewPayoutRequestData;
    $: tagClass = getTagClass(payoutRequest);
    $: tableLine = getTableLine($allFsData, payoutRequest, fsName, fsId, budgetTitle);
</script>
{#if payoutRequest}
    <div class="tags card-header-icon">
        <CopyableTag tagClass={tagClass} text={payoutRequest.status} copyText="{tableLine}"/>
        <CopyableTag text={payoutRequest.request_id}/>
        <CopyableTag text={euroCents(payoutRequest.amount_cents)} bold={true}/>
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