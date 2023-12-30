<script type="ts">
    import {euroCents, getStatusTagClass} from "../util";
    import type {IFullPayoutRequestData, INewPayoutRequestData} from "../Interfaces";
    import CopyableTag from "./CopyableTag.svelte";

    export let payoutRequest: INewPayoutRequestData | IFullPayoutRequestData;
    export let previous: INewPayoutRequestData | IFullPayoutRequestData | null = null;
    $: tagClass = getStatusTagClass(payoutRequest);
    $: previousTagClass = getStatusTagClass(previous);
    $: categoryChanged = previous && previous?.category !== payoutRequest.category;
    $: requestDateChanged = previous && previous?.request_date !== payoutRequest.request_date;
    $: statusChanged = previous && previous?.status !== payoutRequest.status;
    $: statusDateChanged = previous && previous?.status_date !== payoutRequest.status_date;
    $: amountCentsChanged = previous && previous?.amount_cents !== payoutRequest.amount_cents;
    $: commentChanged = previous && previous?.comment !== payoutRequest.comment;
    $: deadlineChanged = previous && previous?.completion_deadline !== payoutRequest.completion_deadline;
    $: referenceChanged = previous && previous?.reference !== payoutRequest.reference;
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
        <td>
            <CopyableTag text={payoutRequest.request_id}/>
        </td>
    </tr>
    <tr class={categoryChanged ? 'has-background-warning' : ''}>
        <th>Kategorie</th>
        {#if !categoryChanged}
            <td>{payoutRequest.category}</td>
        {:else}
            <td>
                <del>{previous?.category}</del>
                <br>
                <b>{payoutRequest.category}</b>
            </td>
        {/if}
    </tr>
    <tr class={requestDateChanged ? 'has-background-warning' : ''}>
        <th>Antragsdatum</th>
        {#if !requestDateChanged}
            <td>{payoutRequest.request_date}</td>
        {:else}
            <td>
                <del>{previous?.request_date}</del>
                <br>
                <b>{payoutRequest.request_date}</b>
            </td>
        {/if}
    </tr>
    <tr class={statusChanged ? 'has-background-warning' : ''}>
        <th>Status</th>
        {#if !statusChanged}
            <td><span class="tag {tagClass}">{payoutRequest.status}</span></td>
        {:else}
            <td>
                <span class="tag {previousTagClass}"><del>{previous?.status}</del></span><br>
                <span class="tag {tagClass}">{payoutRequest.status}</span>
            </td>
        {/if}
    </tr>
    <tr class={statusDateChanged ? 'has-background-warning' : ''}>
        <th>Status-Datum</th>
        {#if !statusDateChanged}
            <td>{payoutRequest.status_date}</td>
        {:else}
            <td>
                <del>{previous?.status_date}</del>
                <br>
                <b>{payoutRequest.status_date}</b>
            </td>
        {/if}
    </tr>
    <tr class={amountCentsChanged ? 'has-background-warning' : ''}>
        <th>Betrag</th>
        {#if !amountCentsChanged}
        <td>
            <CopyableTag text={euroCents(payoutRequest.amount_cents)} bold={true}/>
        </td>
        {:else}
            <td>
                <CopyableTag text={euroCents(previous.amount_cents)} tagClass={'is-light is-strikethrough'}/>
                <br>
                <CopyableTag text={euroCents(payoutRequest.amount_cents)} bold={true}/>
            </td>
        {/if}
    </tr>
    <tr class={commentChanged ? 'has-background-warning' : ''}>
        <th>Kommentar</th>
        {#if !commentChanged}
            <td>{payoutRequest.comment}</td>
        {:else}
            <td>
                <del>{previous?.comment}</del>
                <br>
                <b>{payoutRequest.comment}</b>
            </td>
        {/if}
    </tr>
    <tr class={deadlineChanged ? 'has-background-warning' : ''}>
        <th>Frist zur Vervollständigung</th>
        {#if !deadlineChanged}
            <td>{payoutRequest.completion_deadline}</td>
        {:else}
            <td>
                <del>{previous?.completion_deadline}</del>
                <br>
                <b>{payoutRequest.completion_deadline}</b>
            </td>
        {/if}
    </tr>
    <tr class={referenceChanged ? 'has-background-warning' : ''}>
        <th>Referenz</th>
        {#if !referenceChanged}
            <td>{payoutRequest.reference || ''}</td>
        {:else}
            <td>
                <del>{previous?.reference || ''}</del>
                <br>
                <b>{payoutRequest.reference || ''}</b>
            </td>
        {/if}
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
