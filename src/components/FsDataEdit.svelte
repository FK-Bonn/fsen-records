<script type="ts">
    import type {IFsData} from "../Interfaces";

    export let data: IFsData;
</script>

<dl>
    <dt>E-Mail</dt>
    <dd><input class="input" bind:value={data.email}/></dd>
    <dt>Telefon</dt>
    <dd><input class="input" bind:value={data.phone}/></dd>
    <dt>Webseite</dt>
    <dd><input class="input" bind:value={data.website}/></dd>
    <dt>Adresse</dt>
    <dd><textarea class="textarea" bind:value={data.address}></textarea></dd>
    <dt>Anwesenheitszeiten (AWD)</dt>
    <dd>
        <table class="table">
            <tbody>
            <tr>
                <td>Montag</td>
                <td><input class="input" bind:value={data.serviceTimes.monday}/></td>
            </tr>
            <tr>
                <td>Dienstag</td>
                <td><input class="input" bind:value={data.serviceTimes.tuesday}/></td>
            </tr>
            <tr>
                <td>Mittwoch</td>
                <td><input class="input" bind:value={data.serviceTimes.wednesday}/></td>
            </tr>
            <tr>
                <td>Donnerstag</td>
                <td><input class="input" bind:value={data.serviceTimes.thursday}/></td>
            </tr>
            <tr>
                <td>Freitag</td>
                <td><input class="input" bind:value={data.serviceTimes.friday}/></td>
            </tr>
            </tbody>
        </table>
    </dd>
    <dt>Regelmäßiger Sitzungstermin</dt>
    <dd>
        <dl>
            <dt>Wochentag</dt>
            <dd><input class="input" bind:value={data.regularMeeting.dayOfWeek}/></dd>
            <dt>Uhrzeit</dt>
            <dd><input class="input" bind:value={data.regularMeeting.time}/></dd>
            <dt>Ort</dt>
            <dd><input class="input" bind:value={data.regularMeeting.location}/></dd>
        </dl>
    </dd>
</dl>


<style>
    dt {
        font-weight: bold;
    }

    table {
        background-color: rgba(0, 0, 0, 0);
        width: auto;
    }
</style>
