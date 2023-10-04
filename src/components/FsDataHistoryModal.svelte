<script type="ts">
    import {getFsDataHistory} from "../util";
    import {token} from "../stores";
    import type {IFsData} from "../Interfaces";
    import {onMount} from "svelte";
    import FsDataDisplay from "./FsDataDisplay.svelte";
    import FsDataHistoryEntry from "./FsDataHistoryEntry.svelte";

    export let fsDataHistoryModal: boolean = true;
    export let fs: string;
    let completedRequest: IFsData[] | null = null;
    let message = '';


    const close = (e) => {
        fsDataHistoryModal = false;
    }


    const loadHistory = () => {
        getFsDataHistory(fs, $token)
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
                    Daten für {fs}: Bearbeitungsverlauf
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
                            <FsDataHistoryEntry {fs} {data}
                                                previous="{i===(completedRequest.length-1)?null:completedRequest[i+1]}"
                                                bind:fsDataHistoryModal={fsDataHistoryModal}/>
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
