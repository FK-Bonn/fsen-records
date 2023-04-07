<script type="ts">
    import type {IAllFsData, IPayoutRequestData} from "../Interfaces";
    import {euro} from "../util";
    import CopyableTag from "./CopyableTag.svelte";
    import {allFsData} from "../stores";

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
        if (status === 'GESTELLT') {
            return 'is-dark';
        }
        return 'is-danger';
    }

    const getTableLine = (allData: IAllFsData, payoutRequest: IPayoutRequestData, fsName: string, fsId: string, budgetTitle: string): string => {
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
            payoutRequest.id,
            payoutRequest.requestDate,
            euro(payoutRequest.amount),
            iban,
        ].join('\t')
    }

    export let fsName: string = '';
    export let fsId: string = '';
    export let budgetTitle: string;
    export let payoutRequest: IPayoutRequestData;
    $: tagClass = getTagClass(payoutRequest);
    $: tableLine = getTableLine($allFsData, payoutRequest, fsName, fsId, budgetTitle);
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