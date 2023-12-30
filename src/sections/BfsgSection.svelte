<script type="ts">
    import {INewPayoutRequestData, type IStudentBody} from "../Interfaces";
    import AngleIndicator from "../icons/AngleIndicator.svelte";
    import PayoutRequestsTable from "../components/PayoutRequestsTable.svelte";
    import BfsgRequestModal from "../components/BfsgRequestModal.svelte";
    import VorankuendigungRequestModal from "../components/VorankuendigungRequestModal.svelte";
    import {loggedInUser} from "../stores";

    export let studentBody: IStudentBody;
    export let bfsgPayoutRequests: INewPayoutRequestData[] | undefined;
    export let vorankuendigungPayoutRequests: INewPayoutRequestData[] | undefined;
    export let budgetTitlesBfsg: { [semester: string]: string };
    let opened: boolean = false;
    let bfsgModal: boolean = false;
    let vorankuendigungModal: boolean = false;

    const showBfsgModal = (e) => {
        bfsgModal = true;
        vorankuendigungModal = false;
    }

    const showVorankuendigungModal = (e) => {
        bfsgModal = false;
        vorankuendigungModal = true;
    }

    const toggle = () => {
        opened = !opened;
    }
</script>

<div class="card">
    <header class="card-header" on:click={toggle}>
        <p class="card-header-title">
            BFSG
        </p>
        <button class="card-header-icon" aria-label="more options">
            <AngleIndicator {opened}/>
        </button>
    </header>
    {#if opened}
        <div class="card-content">
            <div class="content">
                <h3 class="heading is-3">Vorankündigungen</h3>
                {#if $loggedInUser && $loggedInUser.admin}
                    <button class="button is-outlined is-small" on:click|stopPropagation={showVorankuendigungModal}>
                        Antrag stellen
                    </button>
                {/if}
                {#if vorankuendigungPayoutRequests}
                    <PayoutRequestsTable singleFS="{true}" bfsgPayoutRequests="{vorankuendigungPayoutRequests}"
                                         {budgetTitlesBfsg} type="vorankuendigung"/>
                {:else}
                    <p class="has-text-grey-dark">Keine vorhanden.</p>
                {/if}

                <h3 class="heading is-3">BFSG-Anträge</h3>
                {#if $loggedInUser && $loggedInUser.admin}
                    <button class="button is-outlined is-small" on:click|stopPropagation={showBfsgModal}>
                        Antrag stellen
                    </button>
                {/if}
                {#if bfsgPayoutRequests}
                    <PayoutRequestsTable singleFS="{true}" {bfsgPayoutRequests} {budgetTitlesBfsg} type="bfsg"/>
                {:else}
                    <p class="has-text-grey-dark">Keine vorhanden.</p>
                {/if}
            </div>
        </div>
    {/if}
</div>

{#if bfsgModal}
    <BfsgRequestModal fsName="{studentBody.name}" fsId="{studentBody.id}" bind:modal={bfsgModal}/>
{/if}

{#if vorankuendigungModal}
    <VorankuendigungRequestModal fsName="{studentBody.name}" fsId="{studentBody.id}" bind:modal={vorankuendigungModal}/>
{/if}

<style>
    .card-header {
        cursor: pointer;
    }
</style>