<script type="ts">
    import {getPayoutRequestHistory} from "../util";
    import {token} from "../stores";
    import type {IFullPayoutRequestData} from "../Interfaces";
    import PayoutRequestTable from "./PayoutRequestTable.svelte";
    import {onMount} from "svelte";

    export let historyModal: boolean = true;
    export let type: string = 'afsg';
    export let payoutRequest: IFullPayoutRequestData;
    let completedRequest: IFullPayoutRequestData[] | null = null;
    let message = '';


    const close = (e) => {
        historyModal = false;
    }


    const loadHistory = () => {
        getPayoutRequestHistory(payoutRequest.request_id, type, $token)
            .then(data => {
                completedRequest = data;
            });
    }

    onMount(() => {
        loadHistory();
    })
</script>
<div class="modal is-active" on:click|stopPropagation>
    <div class="modal-background"></div>
    <div class="modal-content">
        <div class="card">
            <header class="card-header">
                <p class="card-header-title">
                    {type.toUpperCase()}-Antrag {payoutRequest.request_id}: Bearbeitungsverlauf
                </p>
            </header>
            <div class="card-content">
                <div class="content">
                    {#if message}
                        <article class="message">
                            <div class="message-body">
                                {message}
                            </div>
                        </article>
                    {:else if completedRequest}
                        {#each completedRequest as requestState, i}
                            <PayoutRequestTable
                                    payoutRequest={requestState}
                                    previous="{i===(completedRequest.length-1)?null:completedRequest[i+1]}"
                            />
                            <hr>
                        {/each}
                    {:else}
                        Daten werden geladen…
                    {/if}
                </div>
            </div>
            <footer class="card-footer">
                <button class="button card-footer-item" on:click|stopPropagation={close}>Schließen</button>
            </footer>
        </div>
    </div>
    <button class="modal-close is-large" aria-label="close" on:click|stopPropagation={close}></button>
</div>
