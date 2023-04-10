<script type="ts">
    import type {IAllFsData, INewPayoutRequestData} from "../Interfaces";
    import {euroCents, hasFsPermission, isBeforeLastDayForSubmission} from "../util";
    import CopyableTag from "./CopyableTag.svelte";
    import {allFsData, loggedInUser} from "../stores";
    import type {Interval} from "../Calculator";
    import RequestModal from "./RequestModal.svelte";
    import RequestEditModal from "./RequestEditModal.svelte";

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
        if (status === 'EINGEREICHT') {
            return 'is-info';
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

    const showModal = (e) => {
        modal = true;
        editModal = false;
    }

    const showEditModal = (e) => {
        editModal = true;
        modal = false;
    }

    export let fsName: string = '';
    export let fsId: string = '';
    export let budgetTitle: string;
    export let semester: Interval;
    export let payoutRequest: INewPayoutRequestData;
    let modal: boolean = false;
    let editModal: boolean = false;
    $: tagClass = getTagClass(payoutRequest);
    $: tableLine = getTableLine($allFsData, payoutRequest, fsName, fsId, budgetTitle);
    $: isRequestAllowed = isBeforeLastDayForSubmission(semester) && $loggedInUser && ($loggedInUser.admin || hasFsPermission($loggedInUser.permissions, fsId, 2));
</script>
{#if payoutRequest}
    <div class="tags card-header-icon">
        <CopyableTag tagClass={tagClass} text={payoutRequest.status} copyText="{tableLine}"/>
        <CopyableTag text={payoutRequest.request_id}/>
        <CopyableTag text={euroCents(payoutRequest.amount_cents)} bold={true}/>
        {#if $loggedInUser && $loggedInUser.admin}
            <button class="button is-small" on:click|stopPropagation={showEditModal}>✏️</button>
        {/if}
    </div>
{:else if isRequestAllowed}
    <div class="card-header-icon">
        <button class="button is-outlined is-small" on:click|stopPropagation={showModal}>Antrag stellen</button>
    </div>
{/if}
{#if modal}
    <RequestModal {fsName} {fsId} {semester} bind:modal={modal}/>
{/if}
{#if editModal && payoutRequest}
    <RequestEditModal {payoutRequest} bind:editModal={editModal}/>
{/if}

<style>
    .tags {
        margin-bottom: 0;
    }

    .tag {
        margin-bottom: 0;
    }
</style>