<script type="ts">
    import {getProtectedFsDataHistory} from "../util";
    import {token} from "../stores";
    import type {IProtectedFsDataHistoryEntry} from "../Interfaces";
    import {onMount} from "svelte";
    import ProtectedFsDataHistoryEntry from "./ProtectedFsDataHistoryEntry.svelte";
    import FsDataHistoryEntry from "./FsDataHistoryEntry.svelte";

    export let fsProtectedDataHistoryModal: boolean = true;
    export let fs: string;
    let completedRequest: IProtectedFsDataHistoryEntry[] | null = null;
    let message = '';


    const close = (e) => {
        fsProtectedDataHistoryModal = false;
    }


    const loadHistory = () => {
        getProtectedFsDataHistory(fs, $token)
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
                    Interne Daten für {fs}: Bearbeitungsverlauf
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
                        {#each completedRequest as data, i}
                            <ProtectedFsDataHistoryEntry
                                    {data}
                                    {fs}
                                    previous="{i===(completedRequest.length-1)?null:completedRequest[i+1]}"
                                    bind:fsProtectedDataHistoryModal={fsProtectedDataHistoryModal}/>
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
