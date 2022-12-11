<script type="ts">
    import type {IFsData, IStudentBody, IProtectedFsData} from "../Interfaces";
    import {loggedInUser, token} from "../stores";
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

    const loadData = () => {
        loadFsData();
        if ($loggedInUser && studentBody && ($loggedInUser.admin || hasFsPermission($loggedInUser.permissions, studentBody.id, 2))) {
            loadProtectedFsData();
        }
    }
    const loadFsData = () => {
        dataPromise = getFsData(studentBody.id, $token);
    }
    const loadProtectedFsData = () => {
        protectedDataPromise = getProtectedFsData(studentBody.id, $token);
    }
</script>

<div class="fs-data content">
    {#if dataPromise}
        {#await dataPromise}
            Daten werden geladen…
        {:then data}
            {#if editFsData}
                <button on:click={()=>saveFsData(data)} class="button is-small is-bordered is-pulled-right">
                    Speichern
                </button>
                <button on:click={()=>reloadFsData()} class="button is-small is-bordered is-pulled-right">
                    Abbrechen
                </button>
                <FsDataEdit {data}/>
            {:else}
                {#if protectedDataPromise}
                    <button on:click={()=>makeFsDataEditable()} class="button is-small is-bordered is-pulled-right">
                        Bearbeiten
                    </button>
                {/if}
                <FsDataDisplay {data}/>
            {/if}
        {:catch error}
            <ErrorList errors={['Die Daten konnten leider nicht geladen werden.']}/>
        {/await}
    {/if}
    {#if protectedDataPromise}
        {#await protectedDataPromise}
            Daten werden geladen…
        {:then data}
            {#if editProtectedFsData}
                <button on:click={()=>saveProtectedFsData(data)} class="button is-small is-bordered is-pulled-right">
                    Speichern
                </button>
                <button on:click={()=>reloadProtectedFsData()} class="button is-small is-bordered is-pulled-right">
                    Abbrechen
                </button>
                <ProtectedFsDataEdit {data}/>
            {:else}
                <button on:click={()=>makeProtectedFsDataEditable()}
                        class="button is-small is-bordered is-pulled-right">
                    Bearbeiten
                </button>
                <ProtectedFsDataDisplay {data}/>
            {/if}
        {:catch error}
            <ErrorList errors={['Die Daten konnten leider nicht geladen werden.']}/>
        {/await}
    {/if}
    {#if !dataPromise && !protectedDataPromise}
        <button class="button" on:click={()=>loadData()}>Daten laden</button>
    {/if}
</div>

<style>
    .fs-data {
        margin-top: 1em;
    }
</style>
