<script type="ts">
    import {Interval} from "../Calculator";
    import {euroCents, formatDate} from "../util";
    import type {INewPayoutRequestData} from "../Interfaces";

    export let payoutRequest: INewPayoutRequestData;
</script>

<table class="table is-narrow">
    <tr>
        <th>Fachschaft</th>
        <td>{payoutRequest.fs}</td>
    </tr>
    <tr>
        <th>Semester</th>
        <td>{payoutRequest.semester}</td>
    </tr>
    <tr>
        <th>Antragsnummer</th>
        <td>{payoutRequest.request_id}</td>
    </tr>
    <tr>
        <th>Antragsdatum</th>
        <td>{payoutRequest.request_date}</td>
    </tr>
    <tr>
        <th>Status</th>
        <td>{payoutRequest.status}</td>
    </tr>
    <tr>
        <th>Status-Datum</th>
        <td>{payoutRequest.status_date}</td>
    </tr>
    <tr>
        <th>Betrag</th>
        <td>{euroCents(payoutRequest.amount_cents)}</td>
    </tr>
    <tr>
        <th>Kommentar</th>
        <td>{payoutRequest.comment}</td>
    </tr>
    <tr>
        <th>Antrag gestellt von</th>
        <td>{payoutRequest.requester}</td>
    </tr>
    <tr>
        <th>Zuletzt modifiziert am</th>
        <td>{payoutRequest.last_modified_timestamp}</td>
    </tr>
    <tr>
        <th>Zuletzt modifiziert von</th>
        <td>{payoutRequest.last_modified_by}</td>
    </tr>
</table>
