<script type="ts">
    import type {IFsData, IStudentBody, IProtectedFsData} from "../Interfaces";
    import {allFsData, loggedInUser, token} from "../stores";
    import {getFsData, getProtectedFsData, hasFsPermission, putFsData, putProtectedFsData} from "../util";
    import ErrorList from "../components/ErrorList.svelte";
    import FsDataDisplay from "../components/FsDataDisplay.svelte";
    import ProtectedFsDataDisplay from "../components/ProtectedFsDataDisplay.svelte";
    import FsDataEdit from "../components/FsDataEdit.svelte";
    import ProtectedFsDataEdit from "../components/ProtectedFsDataEdit.svelte";

    export let studentBody: IStudentBody;
    let dataPromise: Promise<IFsData> | null = null;
    let protectedDataPromise: Promise<IProtectedFsData> | null = null;
    let editFsData = false;
    let editProtectedFsData = false;
    $: data = $allFsData.hasOwnProperty(studentBody.id) ? $allFsData[studentBody.id].data : null;
    $: protectedData = $allFsData.hasOwnProperty(studentBody.id) ? $allFsData[studentBody.id].protected_data : null;

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
        {#if editFsData}
            <button on:click={()=>saveFsData(data)} class="button is-small is-bordered is-pulled-right">
                Speichern
            </button>
            <button on:click={()=>reloadFsData()} class="button is-small is-bordered is-pulled-right">
                Abbrechen
            </button>
            <FsDataEdit {data}/>
        {:else}
            {#if protectedData}
                <button on:click={()=>makeFsDataEditable()} class="button is-small is-bordered is-pulled-right">
                    Bearbeiten
                </button>
            {/if}
            <FsDataDisplay {data}/>
        {/if}
    {/if}
    {#if protectedData}
        {#if editProtectedFsData}
            <button on:click={()=>saveProtectedFsData(protectedData)}
                    class="button is-small is-bordered is-pulled-right">
                Speichern
            </button>
            <button on:click={()=>reloadProtectedFsData()} class="button is-small is-bordered is-pulled-right">
                Abbrechen
            </button>
            <ProtectedFsDataEdit data="{protectedData}"/>
        {:else}
            <button on:click={()=>makeProtectedFsDataEditable()}
                    class="button is-small is-bordered is-pulled-right">
                Bearbeiten
            </button>
            <ProtectedFsDataDisplay data="{protectedData}"/>
        {/if}
    {/if}
</div>

<style>
    .fs-data {
        margin-top: 1em;
    }
</style>
