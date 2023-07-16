<script type="ts">
    import type {IFsData, IProtectedFsData, IStudentBody} from "../Interfaces";
    import {allFsData, token} from "../stores";
    import {getFsData, getProtectedFsData, putFsData, putProtectedFsData} from "../util";
    import FsDataDisplay from "../components/FsDataDisplay.svelte";
    import ProtectedFsDataDisplay from "../components/ProtectedFsDataDisplay.svelte";
    import FsDataEdit from "../components/FsDataEdit.svelte";
    import ProtectedFsDataEdit from "../components/ProtectedFsDataEdit.svelte";

    export let studentBody: IStudentBody;
    let editFsData = false;
    let editProtectedFsData = false;
    $: data = $allFsData?.hasOwnProperty(studentBody.id) ? $allFsData[studentBody.id].data : null;
    $: protectedData = $allFsData?.hasOwnProperty(studentBody.id) ? $allFsData[studentBody.id].protected_data : null;

    const saveFsData = (data: IFsData) => {
        putFsData(studentBody.id, data, $token).then(() => reloadFsData())
            .catch(() => alert('Speichern fehlgeschlagen.'));
    }

    const saveProtectedFsData = (data: IProtectedFsData) => {
        putProtectedFsData(studentBody.id, data, $token).then(() => reloadProtectedFsData())
            .catch(() => alert('Speichern fehlgeschlagen.'));
    }

    const reloadFsData = () => {
        editFsData = false;
        loadFsData();
    }

    const reloadProtectedFsData = () => {
        editProtectedFsData = false;
        loadProtectedFsData();
    }

    const makeFsDataEditable = () => {
        editFsData = true;
    }

    const makeProtectedFsDataEditable = () => {
        editProtectedFsData = !editProtectedFsData;
    }

    const loadFsData = () => {
        getFsData(studentBody.id, $token).then(data => {
            $allFsData[studentBody.id].data = data;
        });
    }
    const loadProtectedFsData = () => {
        getProtectedFsData(studentBody.id, $token).then(data => {
            $allFsData[studentBody.id].protected_data = data;
        });
    }
</script>

<div class="fs-data content">
    {#if data}
        {#if !data.is_latest}
            <article class="message is-danger">
                <div class="message-header"><p>Neuere Daten vorhanden</p></div>
                <div class="message-body">
                    <p>
                        Diese Daten sind veraltet.
                        Es sind neuere Daten vorhanden, die allerdings noch nicht überprüft wurden
                        und deshalb nicht angezeigt werden.</p>
                </div>
            </article>
        {/if}
        {#if editFsData}
            <button on:click={()=>saveFsData(data.data)} class="button is-small is-bordered is-pulled-right">
                Speichern
            </button>
            <button on:click={()=>reloadFsData()} class="button is-small is-bordered is-pulled-right">
                Abbrechen
            </button>
            <FsDataEdit data="{data.data}"/>
        {:else}
            {#if protectedData}
                <button on:click={()=>makeFsDataEditable()} class="button is-small is-bordered is-pulled-right">
                    Bearbeiten
                </button>
            {/if}
            <FsDataDisplay data="{data.data}"/>
        {/if}
    {/if}
    {#if protectedData}
        {#if !protectedData.is_latest}
            <article class="message is-danger">
                <div class="message-header"><p>Neuere interne Daten vorhanden</p></div>
                <div class="message-body">
                    <p>
                        Diese internen Daten sind veraltet.
                        Es sind neuere interne Daten vorhanden, die allerdings noch nicht überprüft wurden
                        und deshalb nicht angezeigt werden.</p>
                </div>
            </article>
        {/if}
        {#if editProtectedFsData}
            <button on:click={()=>saveProtectedFsData(protectedData.data)}
                    class="button is-small is-bordered is-pulled-right">
                Speichern
            </button>
            <button on:click={()=>reloadProtectedFsData()} class="button is-small is-bordered is-pulled-right">
                Abbrechen
            </button>
            <ProtectedFsDataEdit data="{protectedData.data}"/>
        {:else}
            <button on:click={()=>makeProtectedFsDataEditable()}
                    class="button is-small is-bordered is-pulled-right">
                Bearbeiten
            </button>
            <ProtectedFsDataDisplay data="{protectedData.data}"/>
        {/if}
    {/if}
</div>

<style>
    .fs-data {
        margin-top: 1em;
    }
</style>
