<script type="ts">
    import type {IFsDataHistoryEntry} from "../Interfaces";
    import {approveFsData, getFsData, putFsData, putProtectedFsData} from "../util";
    import {allFsData, token} from "../stores";
    import TS from "./TS.svelte";

    export let data: IFsDataHistoryEntry;
    export let fs: string;

    export let fsDataHistoryModal: boolean = true;
    let message = '';

    const loadFsData = () => {
        getFsData(fs, $token).then(data => {
            $allFsData[fs].data = data;
        });
    }

    const approve = () => {
        approveFsData(data.id, $token).then(value => {
            message = value.message;
            loadFsData();
        })
    }

    const restore = () => {
        putFsData(fs, data, $token).then(() => {
            loadFsData();
            fsDataHistoryModal = false;
        }).catch(() => alert('Speichern fehlgeschlagen.'));
    }
</script>

<div class="box has-background-warning-light">
    <h4>Stand von: <TS ts="{data.timestamp}"/> ({data.user})</h4>
    <button class="button is-small" on:click={()=>restore()}>
        Wiederherstellen
    </button>

    <dl>
        <dt>E-Mail</dt>
        <dd><a href="mailto:{data.email}">{data.email}</a></dd>
        <dt>Telefon</dt>
        <dd><a href="tel:{data.phone}">{data.phone}</a></dd>
        <dt>Webseite</dt>
        <dd><a href="{data.website}">{data.website}</a></dd>
        <dt>Adresse</dt>
        <dd class="address">{data.address}</dd>
        <dt>Anwesenheitszeiten (AWD)</dt>
        <dd>
            <table class="table">
                <tbody>
                <tr>
                    <td>Montag</td>
                    <td>{data.serviceTimes?.monday}</td>
                </tr>
                <tr>
                    <td>Dienstag</td>
                    <td>{data.serviceTimes?.tuesday}</td>
                </tr>
                <tr>
                    <td>Mittwoch</td>
                    <td>{data.serviceTimes?.wednesday}</td>
                </tr>
                <tr>
                    <td>Donnerstag</td>
                    <td>{data.serviceTimes?.thursday}</td>
                </tr>
                <tr>
                    <td>Freitag</td>
                    <td>{data.serviceTimes?.friday}</td>
                </tr>
                </tbody>
            </table>
        </dd>
        <dt>Regelmäßiger Sitzungstermin</dt>
        <dd>
            <dl>
                <dt>Wochentag</dt>
                <dd>{data.regularMeeting?.dayOfWeek}</dd>
                <dt>Uhrzeit</dt>
                <dd>{data.regularMeeting?.time}</dd>
                <dt>Ort</dt>
                <dd>{data.regularMeeting?.location}</dd>
            </dl>
        </dd>
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

    dd.address {
        white-space: pre;
    }

    table {
        background-color: rgba(0, 0, 0, 0);
        width: auto;
    }
</style>
