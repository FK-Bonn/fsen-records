<script type="ts">
    import {editPayoutRequest, formatIsoDate, getBfsgPayoutRequestData, getPayoutRequestData} from "../util";
    import {afsgPayoutRequestData, bfsgPayoutRequestData, token, vorankuendigungPayoutRequestData} from "../stores";
    import type {IFullPayoutRequestData, INewPayoutRequestData} from "../Interfaces";
    import PayoutRequestTable from "./PayoutRequestTable.svelte";
    import RequestStatusOptions from "./RequestStatusOptions.svelte";

    export let payoutRequest: INewPayoutRequestData | IFullPayoutRequestData;
    export let editModal: boolean = true;
    export let type: string = 'afsg';

    let status: string = payoutRequest.status;
    let status_date: string = payoutRequest.status_date;
    let amount_cents: number = payoutRequest.amount_cents;
    let comment: string = payoutRequest.comment;
    let completion_deadline: string = payoutRequest.completion_deadline;
    let reference: string = payoutRequest.reference;

    let completedRequest: IFullPayoutRequestData | null = null;
    let message = '';


    const close = (e) => {
        editModal = false;
    }

    const setStatusDateToToday = () => {
        const today = new Date();
        status_date = formatIsoDate(today);
    }

    const yeetRequest = () => {
        const data = {status, status_date, amount_cents, comment, completion_deadline, reference};
        editPayoutRequest(payoutRequest.request_id, type, data, $token).then(value => {
            message = value.message;
            completedRequest = value.payoutRequest;
            reloadPayoutRequestData();
        })
    }

    const locale = 'de-DE'
    const numDecimals = 2;
    const formatter = new Intl.NumberFormat(locale, {maximumFractionDigits: numDecimals});

    let input;
    $: valueFormatted = formatter.format(amount_cents / 100);

    function moneyInputHandler(e) {
        const tempValue = parseNumber(e.currentTarget.value);
        if (isNaN(tempValue)) {
            amount_cents = 0;
            return;
        }
        amount_cents = Math.round(tempValue * 100);
    }

    const parseNumber = (value) => {
        return parseFloat(value.replace(/[^\d,]/, '').replace(',', '.'))
    }

    const reloadPayoutRequestData = () => {
        if (type === 'afsg') {
            getPayoutRequestData(type)
                .then(data => {
                    $afsgPayoutRequestData = data;
                });
        } else if (type === 'bfsg') {
            getBfsgPayoutRequestData(type)
                .then(data => {
                    $bfsgPayoutRequestData = data;
                });
        } else if (type === 'vorankuendigung') {
            getBfsgPayoutRequestData(type)
                .then(data => {
                    $vorankuendigungPayoutRequestData = data;
                });
        }
    }

</script>
<div class="modal is-active" on:click|stopPropagation>
    <div class="modal-background"></div>
    <div class="modal-content">
        <div class="card">
            <header class="card-header">
                <p class="card-header-title">
                    {type.toUpperCase()}-Antrag {payoutRequest.request_id} bearbeiten
                </p>
            </header>
            {#if completedRequest || message}
                <div class="card-content">
                    <div class="content">
                        <article class="message">
                            <div class="message-body">
                                {message}
                            </div>
                        </article>
                        {#if completedRequest}
                            <PayoutRequestTable payoutRequest={completedRequest}/>
                        {/if}
                    </div>
                </div>
                <footer class="card-footer">
                    <button class="button card-footer-item" on:click|stopPropagation={close}>Schließen</button>
                </footer>
            {:else}
                <div class="card-content">
                    <div class="content">
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
                                <th>kategorie</th>
                                <td>{payoutRequest.category}</td>
                            </tr>
                            <tr>
                                <th>Antragsdatum</th>
                                <td>{payoutRequest.request_date}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>
                                    <select class="select" bind:value={status} on:change={setStatusDateToToday}>
                                        <RequestStatusOptions type="{payoutRequest.type}"/>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th>Status-Datum</th>
                                <td>
                                    <input class="input" type="text" bind:value={status_date}>
                                </td>
                            </tr>
                            <tr>
                                <th>Betrag</th>
                                <td>
                                    <input class="input" value={valueFormatted} on:keyup={moneyInputHandler}>
                                </td>
                            </tr>
                            <tr>
                                <th>Kommentar</th>
                                <td>
                                    <textarea class="input" type="text" bind:value={comment}></textarea>
                                </td>
                            </tr>
                            <tr>
                                <th>Frist zur Vervollständigung</th>
                                <td>
                                    <input class="input" type="text" bind:value={completion_deadline}>
                                </td>
                            </tr>
                            <tr>
                                <th>Referenz</th>
                                <td>
                                    <input class="input" type="text" bind:value={reference}>
                                </td>
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
                    </div>
                </div>
                <footer class="card-footer">
                    <button class="button card-footer-item" on:click|stopPropagation={yeetRequest}>Speichern</button>
                    <button class="button card-footer-item" on:click|stopPropagation={close}>Abbrechen</button>
                </footer>
            {/if}
        </div>
    </div>
    <button class="modal-close is-large" aria-label="close" on:click|stopPropagation={close}></button>
</div>
