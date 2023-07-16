<script type="ts">
    import type {IProtectedFsDataHistoryEntry} from "../Interfaces";
    import {approveProtectedFsData, getProtectedFsData, putProtectedFsData} from "../util";
    import {allFsData, token} from "../stores";
    import TS from "./TS.svelte";

    export let data: IProtectedFsDataHistoryEntry;
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
</script>

<div class="box has-background-warning-light">
    <h4>Stand von: <TS ts="{data.timestamp}"/> ({data.user})</h4>

    <button class="button is-small" on:click={()=>restore()}>
        Wiederherstellen
    </button>

    <dl>
        <dt>IBAN</dt>
        <dd>{data.iban}</dd>
        <dt>BIC</dt>
        <dd>{data.bic}</dd>
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
            <tr>
                <th>{email_address.address}</th>
                {#each ['kontakt', 'fsl', 'finanzen'] as usage}
                    <td>{email_address.usages.includes(usage) ? '✔️' : ''}</td>
                {/each}
            </tr>
        {/each}
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
