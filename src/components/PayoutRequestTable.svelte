<script type="ts">
    import {Interval} from "../Calculator";
    import {euroCents, formatDate, getStatusTagClass} from "../util";
    import type {IFullPayoutRequestData, INewPayoutRequestData} from "../Interfaces";
    import CopyableTag from "./CopyableTag.svelte";

    export let payoutRequest: INewPayoutRequestData | IFullPayoutRequestData;
    $: tagClass = getStatusTagClass(payoutRequest);
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
        <td><CopyableTag text={payoutRequest.request_id}/></td>
    </tr>
    <tr>
        <th>Antragsdatum</th>
        <td>{payoutRequest.request_date}</td>
    </tr>
    <tr>
        <th>Status</th>
        <td><span class="tag {tagClass}">{payoutRequest.status}</span></td>
    </tr>
    <tr>
        <th>Status-Datum</th>
        <td>{payoutRequest.status_date}</td>
    </tr>
    <tr>
        <th>Betrag</th>
        <td><CopyableTag text={euroCents(payoutRequest.amount_cents)} bold={true}/></td>
    </tr>
    <tr>
        <th>Kommentar</th>
        <td>{payoutRequest.comment}</td>
    </tr>
    <tr>
        <th>Frist zur Vervollständigung</th>
        <td>{payoutRequest.completion_deadline}</td>
    </tr>
    <tr>
        <th>Antrag gestellt von</th>
        <td>{payoutRequest.requester || '(versteckt)'}</td>
    </tr>
    <tr>
        <th>Zuletzt modifiziert am</th>
        <td>{payoutRequest.last_modified_timestamp || '(versteckt)'}</td>
    </tr>
    <tr>
        <th>Zuletzt modifiziert von</th>
        <td>{payoutRequest.last_modified_by || '(versteckt)'}</td>
    </tr>
</table>
