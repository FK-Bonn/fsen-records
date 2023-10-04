<script type="ts">
    import type {IProtectedFsDataHistoryEntry} from "../Interfaces";
    import {approveProtectedFsData, getProtectedFsData, putProtectedFsData} from "../util";
    import {allFsData, token} from "../stores";
    import TS from "./TS.svelte";

    export let data: IProtectedFsDataHistoryEntry;
    export let previous: IProtectedFsDataHistoryEntry | null;
    export let fs: string;
    export let fsProtectedDataHistoryModal: boolean = true;
    let message = '';

    const loadProtectedFsData = () => {
        getProtectedFsData(fs, $token).then(data => {
            $allFsData[fs].protected_data = data;
        });
    }

    const approve = () => {
        approveProtectedFsData(data.id, $token).then(value => {
            message = value.message;
            loadProtectedFsData();
        })
    }

    const restore = () => {
        putProtectedFsData(fs, data, $token).then(() => {
            loadProtectedFsData();
            fsProtectedDataHistoryModal = false;
        }).catch(() => alert('Speichern fehlgeschlagen.'));
    }
    $: ibanChanged = previous && previous?.iban !== data.iban;
    $: bicChanged = previous && previous?.bic !== data.bic;
</script>

<div class="box has-background-warning-light">
    <h4>Stand von:
        <TS ts="{data.timestamp}"/>
        ({data.user})
    </h4>

    <button class="button is-small" on:click={()=>restore()}>
        Wiederherstellen
    </button>

    <dl>
        <dt>IBAN</dt>
        <dd class="{ibanChanged ? 'has-background-warning':''}">
            {#if !ibanChanged}
                {data.iban}
            {:else}
                <del>{previous.iban}</del>
                <br>
                <b>{data.iban}</b>
            {/if}
        </dd>
        <dt>BIC</dt>
        <dd class="{bicChanged ? 'has-background-warning':''}">
            {#if !bicChanged}
                {data.bic}
            {:else}
                <del>{previous.bic}</del>
                <br>
                <b>{data.bic}</b>
            {/if}
        </dd>
    </dl>
    <table class="table table-sm is-bordered">
        <thead>
        <tr>
            <th>E-Mail-Adresse</th>
            <th>kontakt</th>
            <th>fsl</th>
            <th>finanzen</th>
        </tr>
        </thead>
        <tbody>
        {#each data.email_addresses as email_address}
            {#if !previous || previous.email_addresses.some(value => JSON.stringify(value) === JSON.stringify(email_address))}
                <tr>
                    <th>{email_address.address}</th>
                    {#each ['kontakt', 'fsl', 'finanzen'] as usage}
                        <td>{email_address.usages.includes(usage) ? '✔️' : '❌'}</td>
                    {/each}
                </tr>
            {:else if previous && previous.email_addresses.some(value => value.address === email_address.address)}
                <tr class="has-background-warning">
                    <th>{email_address.address}</th>
                    {#each ['kontakt', 'fsl', 'finanzen'] as usage}
                        <td>{previous.email_addresses.find(value => value.address === email_address.address).usages.includes(usage) ? '✔️' : '❌'}
                            → {email_address.usages.includes(usage) ? '✔️' : '❌'}</td>
                    {/each}
                </tr>
            {:else}
                <tr class="has-background-success">
                    <th>{email_address.address}</th>
                    {#each ['kontakt', 'fsl', 'finanzen'] as usage}
                        <td>{email_address.usages.includes(usage) ? '✔️' : '❌'}</td>
                    {/each}
                </tr>
            {/if}
        {/each}
        {#if previous}
            {#each previous.email_addresses as email_address}
                {#if !data.email_addresses.some(value => value.address === email_address.address)}
                    <tr class="has-background-danger">
                        <th>
                            <del>{email_address.address}</del>
                        </th>
                        {#each ['kontakt', 'fsl', 'finanzen'] as usage}
                            <td>{email_address.usages.includes(usage) ? '✔️' : '❌'}</td>
                        {/each}
                    </tr>
                {/if}
            {/each}
        {/if}
        </tbody>
    </table>
    <dl>
        <dt>Bestätigt?</dt>
        <dd>
            {#if data.approved}
                Bestätigt von {data.approved_by}: {data.approval_timestamp}
            {:else}
                {#if message}
                    {message}
                {:else}
                    <button class="button is-small" on:click={()=>approve()}>
                        Bestätigen
                    </button>
                {/if}
            {/if}
        </dd>
    </dl>
</div>


<style>
    dt {
        font-weight: bold;
    }

    table {
        background-color: rgba(0, 0, 0, 0);
        width: auto;
    }

    summary {
        font-weight: bold;
        cursor: pointer;
    }

    details[open] > summary:first-of-type {
        margin-bottom: 1em;
    }
</style>
