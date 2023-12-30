<script type="ts">
    import type {IAllFsData, INewPayoutRequestData} from "../Interfaces";
    import {euroCents, getStatusTagClass} from "../util";
    import CopyableTag from "./CopyableTag.svelte";
    import {allFsData, loggedInUser} from "../stores";
    import RequestEditModal from "./RequestEditModal.svelte";
    import RequestHistoryModal from "./RequestHistoryModal.svelte";


    const getTableLine = (allData: IAllFsData, payoutRequest: INewPayoutRequestData, budgetTitle: string): string => {
        if (!payoutRequest) {
            return '';
        }
        if (payoutRequest.type === 'vorankuendigung') {
            return 'Vorankündigungen können nicht ausgezahlt werden 🙃';
        }
        let iban = 'IBAN';
        const fsId = payoutRequest.fs;
        const fsName = fsId;
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


    const showEditModal = (e) => {
        editModal = true;
        historyModal = false;
    }

    const showHistoryModal = (e) => {
        editModal = false;
        historyModal = true;
    }

    export let singleFS: boolean;
    export let type: string;
    export let payoutRequest: INewPayoutRequestData;
    export let budgetTitlesBfsg: { [semester: string]: string };
    let editModal: boolean = false;
    let historyModal: boolean = false;
    $: tagClass = getStatusTagClass(payoutRequest);
    $: budgetTitle = budgetTitlesBfsg ? budgetTitlesBfsg[payoutRequest.semester] : '';
    $: tableLine = getTableLine($allFsData, payoutRequest, budgetTitle);
</script>
<tr>
    <td>
        <CopyableTag text={payoutRequest.request_id}/>
    </td>
    {#if !singleFS}
        <td>{payoutRequest.fs}</td>
    {/if}
    <td>{payoutRequest.category}</td>
    <td>{payoutRequest.semester}</td>
    <td>
        <CopyableTag text={euroCents(payoutRequest.amount_cents)} bold={true}/>
    </td>
    <td>
        <CopyableTag tagClass={tagClass} text={payoutRequest.status} copyText="{tableLine}"/>
    </td>
    <td>
        <button class="button is-small" on:click|stopPropagation={showHistoryModal}
                title="Bearbeitungsverlauf anzeigen">
            📜
        </button>
        {#if $loggedInUser && $loggedInUser.admin}
            <button class="button is-small" on:click|stopPropagation={showEditModal} title="Antrag bearbeiten">
                ✏️
            </button>
        {/if}
    </td>
</tr>
{#if editModal && payoutRequest}
    <RequestEditModal {payoutRequest} {type} bind:editModal={editModal}/>
{/if}
{#if historyModal && payoutRequest}
    <RequestHistoryModal {payoutRequest} {type} bind:historyModal={historyModal}/>
{/if}

<style>
    .tags {
        margin-bottom: 0;
    }

    .tag {
        margin-bottom: 0;
    }
</style>