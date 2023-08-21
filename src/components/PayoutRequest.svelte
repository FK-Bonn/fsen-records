<script type="ts">
    import type {IAllFsData, INewPayoutRequestData} from "../Interfaces";
    import {euroCents, hasFsPermission, isBeforeLastDayForSubmission, getStatusTagClass} from "../util";
    import CopyableTag from "./CopyableTag.svelte";
    import {allFsData, loggedInUser} from "../stores";
    import type {Interval} from "../Calculator";
    import RequestModal from "./RequestModal.svelte";
    import RequestEditModal from "./RequestEditModal.svelte";
    import RequestHistoryModal from "./RequestHistoryModal.svelte";


    const getTableLine = (allData: IAllFsData, payoutRequest: INewPayoutRequestData, fsName: string, fsId: string, budgetTitle: string): string => {
        if (!payoutRequest) {
            return '';
        }
        let iban = 'IBAN';
        if (allData?.hasOwnProperty(fsId)) {
            const fsData = allData[fsId];
            if (fsData.protected_data) {
                if (fsData.protected_data.is_latest) {
                    iban = fsData.protected_data.data.iban;
                } else {
                    iban = 'DIE INTERNEN DATEN WURDEN MODIFIZIERT, BITTE PRÜFEN, GGF BESTÄTIGEN, DANN NEU KOPIEREN';
                }
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
        historyModal = false;
    }

    const showEditModal = (e) => {
        editModal = true;
        modal = false;
        historyModal = false;
    }

    const showHistoryModal = (e) => {
        editModal = false;
        modal = false;
        historyModal = true;
    }

    export let fsName: string = '';
    export let fsId: string = '';
    export let budgetTitle: string;
    export let semester: Interval;
    export let payoutRequest: INewPayoutRequestData;
    let modal: boolean = false;
    let editModal: boolean = false;
    let historyModal: boolean = false;
    $: tagClass = getStatusTagClass(payoutRequest);
    $: tableLine = getTableLine($allFsData, payoutRequest, fsName, fsId, budgetTitle);
    $: isRequestAllowed = isBeforeLastDayForSubmission(semester) && $loggedInUser && ($loggedInUser.admin || hasFsPermission($loggedInUser.permissions, fsId, 'submit_payout_request'));
</script>
{#if payoutRequest}
    <div class="tags card-header-icon">
        <CopyableTag tagClass={tagClass} text={payoutRequest.status} copyText="{tableLine}"/>
        <CopyableTag text={payoutRequest.request_id}/>
        <CopyableTag text={euroCents(payoutRequest.amount_cents)} bold={true}/>
        <button class="button is-small" on:click|stopPropagation={showHistoryModal} title="Bearbeitungsverlauf anzeigen">
            📜
        </button>
        {#if $loggedInUser && $loggedInUser.admin}
            <button class="button is-small" on:click|stopPropagation={showEditModal} title="Antrag bearbeiten">
                ✏️
            </button>
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
{#if historyModal && payoutRequest}
    <RequestHistoryModal {payoutRequest} bind:historyModal={historyModal}/>
{/if}

<style>
    .tags {
        margin-bottom: 0;
    }

    .tag {
        margin-bottom: 0;
    }
</style>