<script type="ts">
    import type {IFsDataHistoryEntry} from "../Interfaces";
    import {approveFsData, getFsData, putFsData} from "../util";
    import {allFsData, token} from "../stores";
    import TS from "./TS.svelte";

    export let data: IFsDataHistoryEntry;
    export let previous: IFsDataHistoryEntry | null;
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

    $: emailChanged = previous && previous.email !== data.email;
    $: phoneChanged = previous && previous.phone !== data.phone;
    $: websiteChanged = previous && previous.website !== data.website;
    $: addressChanged = previous && previous.address !== data.address;
    $: serviceTimesMondayChanged = previous && previous.serviceTimes?.monday !== data.serviceTimes?.monday;
    $: serviceTimesTuesdayChanged = previous && previous.serviceTimes?.tuesday !== data.serviceTimes?.tuesday;
    $: serviceTimesWednesdayChanged = previous && previous.serviceTimes?.wednesday !== data.serviceTimes?.wednesday;
    $: serviceTimesThursdayChanged = previous && previous.serviceTimes?.thursday !== data.serviceTimes?.thursday;
    $: serviceTimesFridayChanged = previous && previous.serviceTimes?.friday !== data.serviceTimes?.friday;
    $: regularMeetingDayOfWeekChanged = previous && previous.regularMeeting?.dayOfWeek !== data.regularMeeting?.dayOfWeek;
    $: regularMeetingTimeChanged = previous && previous.regularMeeting?.time !== data.regularMeeting?.time;
    $: regularMeetingLocationChanged = previous && previous.regularMeeting?.location !== data.regularMeeting?.location;
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
        <dt>E-Mail</dt>
        <dd class="{emailChanged ? 'has-background-warning':''}">
            {#if !emailChanged}
                <a href="mailto:{data.email}">{data.email}</a>
            {:else}
                <del>{previous.email}</del>
                <br>
                <a href="mailto:{data.email}"><b>{data.email}</b></a>
            {/if}
        </dd>
        <dt>Telefon</dt>
        <dd class="{phoneChanged ? 'has-background-warning':''}">
            {#if !phoneChanged}
                <a href="tel:{data.phone}">{data.phone}</a>
            {:else}
                <del>{previous.phone}</del>
                <br>
                <a href="tel:{data.phone}"><b>{data.phone}</b></a>
            {/if}
        </dd>
        <dt>Webseite</dt>
        <dd class="{websiteChanged ? 'has-background-warning':''}">
            {#if !websiteChanged}
                <a href="{data.website}">{data.website}</a>
            {:else}
                <del>{previous.website}</del>
                <br>
                <a href="{data.website}"><b>{data.website}</b></a>
            {/if}
        </dd>
        <dt>Adresse</dt>
        <dd class="address {addressChanged ? 'has-background-warning':''}">
            {#if !addressChanged}
                {data.address}
            {:else}
                <del>{previous.address}</del>
                <br>
                <b>{data.address}</b>
            {/if}
        </dd>
        <dt>Anwesenheitszeiten (AWD)</dt>
        <dd>
            <table class="table">
                <tbody>
                <tr class="{serviceTimesMondayChanged ? 'has-background-warning':''}">
                    <td>Montag</td>
                    <td>
                        {#if !serviceTimesMondayChanged}
                            {data.serviceTimes?.monday}
                        {:else}
                            <del>{previous.serviceTimes?.monday}</del>
                            <br>
                            <b>{data.serviceTimes?.monday}</b>
                        {/if}
                    </td>
                </tr>
                <tr class="{serviceTimesTuesdayChanged ? 'has-background-warning':''}">
                    <td>Dienstag</td>
                    <td>
                        {#if !serviceTimesTuesdayChanged}
                            {data.serviceTimes?.tuesday}
                        {:else}
                            <del>{previous.serviceTimes?.tuesday}</del>
                            <br>
                            <b>{data.serviceTimes?.tuesday}</b>
                        {/if}
                    </td>
                </tr>
                <tr class="{serviceTimesWednesdayChanged ? 'has-background-warning':''}">
                    <td>Mittwoch</td>
                    <td>
                        {#if !serviceTimesWednesdayChanged}
                            {data.serviceTimes?.wednesday}
                        {:else}
                            <del>{previous.serviceTimes?.wednesday}</del>
                            <br>
                            <b>{data.serviceTimes?.wednesday}</b>
                        {/if}
                    </td>
                </tr>
                <tr class="{serviceTimesThursdayChanged ? 'has-background-warning':''}">
                    <td>Donnerstag</td>
                    <td>
                        {#if !serviceTimesThursdayChanged}
                            {data.serviceTimes?.thursday}
                        {:else}
                            <del>{previous.serviceTimes?.thursday}</del>
                            <br>
                            <b>{data.serviceTimes?.thursday}</b>
                        {/if}
                    </td>
                </tr>
                <tr class="{serviceTimesFridayChanged ? 'has-background-warning':''}">
                    <td>Freitag</td>
                    <td>
                        {#if !serviceTimesFridayChanged}
                            {data.serviceTimes?.friday}
                        {:else}
                            <del>{previous.serviceTimes?.friday}</del>
                            <br>
                            <b>{data.serviceTimes?.friday}</b>
                        {/if}
                    </td>
                </tr>
                </tbody>
            </table>
        </dd>
        <dt>Regelmäßiger Sitzungstermin</dt>
        <dd>
            <dl>
                <dt>Wochentag</dt>
                <dd class="{regularMeetingDayOfWeekChanged ? 'has-background-warning':''}">
                    {#if !regularMeetingDayOfWeekChanged}
                        {data.regularMeeting?.dayOfWeek}
                    {:else}
                        <del>{previous.regularMeeting?.dayOfWeek}</del>
                        <br>
                        <b>{data.regularMeeting?.dayOfWeek}</b>
                    {/if}
                </dd>
                <dt>Uhrzeit</dt>
                <dd class="{regularMeetingTimeChanged ? 'has-background-warning':''}">
                    {#if !regularMeetingTimeChanged}
                        {data.regularMeeting?.time}
                    {:else}
                        <del>{previous.regularMeeting?.time}</del>
                        <br>
                        <b>{data.regularMeeting?.time}</b>
                    {/if}
                </dd>
                <dt>Ort</dt>
                <dd class="{regularMeetingLocationChanged ? 'has-background-warning':''}">
                    {#if !regularMeetingLocationChanged}
                        {data.regularMeeting?.location}
                    {:else}
                        <del>{previous.regularMeeting?.location}</del>
                        <br>
                        <b>{data.regularMeeting?.location}</b>
                    {/if}
                </dd>
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
