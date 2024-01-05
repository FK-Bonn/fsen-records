<script type="ts">
    import {createBfsgPayoutRequest, getBfsgPayoutRequestData} from "../util";
    import {bfsgPayoutRequestData, token} from "../stores";
    import type {INewPayoutRequestData} from "../Interfaces";
    import PayoutRequestTable from "./PayoutRequestTable.svelte";
    import RequestStatusOptions from "./RequestStatusOptions.svelte";

    export let fsName: string = '';
    export let fsId: string = '';
    export let modal: boolean = true;
    let completedRequest: INewPayoutRequestData | null = null;
    let message = '';
    let semesterId = '';
    let amount_cents = 0;
    let category = '';
    let status = '';
    let status_date = '';
    let request_date = '';
    let comment = '';
    let completion_deadline = '';
    let reference = '';


    const close = (e) => {
        modal = false;
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

    const yeetRequest = () => {
        createBfsgPayoutRequest(fsId, semesterId, category, amount_cents, status, status_date,
            comment, completion_deadline, reference, request_date, $token).then(value => {
            message = value.message;
            completedRequest = value.payoutRequest;
            reloadPayoutRequestData();
        })
    }

    const reloadPayoutRequestData = () => {
        getBfsgPayoutRequestData('bfsg')
            .then(data => {
                $bfsgPayoutRequestData = data;
            });
    }
</script>
<div class="modal is-active" on:click|stopPropagation>
    <div class="modal-background"></div>
    <div class="modal-content">
        <div class="card">
            <header class="card-header">
                <p class="card-header-title">
                    BFSG-Antrag stellen
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
                        BFSG-Antrag für die Fachschaft <b>{fsName}</b> stellen?
                        <div class="field">
                            <label class="label" for="semesterId">Semester*</label>
                            <div class="control">
                                <select class="select" id="semesterId" bind:value={semesterId}>
                                    <option value='2020-SoSe'>2020-SoSe</option>
                                    <option value='2020-WiSe'>2020-WiSe</option>
                                    <option value='2021-SoSe'>2021-SoSe</option>
                                    <option value='2021-WiSe'>2021-WiSe</option>
                                    <option value='2022-SoSe'>2022-SoSe</option>
                                    <option value='2022-WiSe'>2022-WiSe</option>
                                    <option value='2023-SoSe'>2023-SoSe</option>
                                    <option value='2023-WiSe'>2023-WiSe</option>
                                    <option value='2024-SoSe'>2024-SoSe</option>
                                    <option value='2024-WiSe'>2024-WiSe</option>
                                    <option value='2025-SoSe'>2025-SoSe</option>
                                    <option value='2025-WiSe'>2025-WiSe</option>
                                </select>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label" for="valueFormatted">Betrag*</label>
                            <div class="control">
                                <input class="input" id="valueFormatted" value={valueFormatted} on:keyup={moneyInputHandler}>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label" for="category">Kategorie*</label>
                            <div class="control">
                                <select class="select" id="category" bind:value={category}>
                                    <option value='2.1.1 Erstsemesterarbeit'>2.1.1 Erstsemesterarbeit</option>
                                    <option value='2.1.2 Inhaltliche Veranstaltungen'>2.1.2 Inhaltliche
                                        Veranstaltungen
                                    </option>
                                    <option value='3.1.1 Erstsemesterfahrt'>3.1.1 Erstsemesterfahrt</option>
                                    <option value='3.1.2 Klausurfahrten'>3.1.2 Klausurfahrten</option>
                                    <option value='3.1.3 Teilnahme BuFaTa'>3.1.3 Teilnahme BuFaTa</option>
                                    <option value='4.2 Bildungsfahrt'>4.2 Bildungsfahrt</option>
                                    <option value='4.3 Tagesexkursion'>4.3 Tagesexkursion</option>
                                    <option value='5.1.1 Computer und Zubehör'>5.1.1 Computer und Zubehör</option>
                                    <option value='5.1.2 Ausrichtung BuFaTa'>5.1.2 Ausrichtung BuFaTa</option>
                                    <option value='5.1.3 Fachschaftsneugründung'>5.1.3 Fachschaftsneugründung</option>
                                    <option value='5.1.4 Schulungen'>5.1.4 Schulungen</option>
                                    <option value='Außerhalb KritKat'>Außerhalb KritKat</option>
                                </select>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label" for="status">Status</label>
                            <div class="control">
                                <select class="select" id="status" bind:value={status}>
                                    <RequestStatusOptions type="bfsg"/>
                                </select>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label" for="statusDate">Status-Datum</label>
                            <div class="control">
                                <input class="input" id="statusDate" type="text" bind:value={status_date}>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label" for="requestDate">Antragsdatum</label>
                            <div class="control">
                                <input class="input" id="requestDate" type="text" bind:value={request_date}>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label" for="comment">Kommentar</label>
                            <div class="control">
                                <textarea class="input" id="comment" type="text" bind:value={comment}></textarea>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label" for="completionDeadline">Frist zur Vervollständigung</label>
                            <div class="control">
                                <input class="input" id="completionDeadline" type="text" bind:value={completion_deadline}>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label" for="reference">Referenz</label>
                            <div class="control">
                                <input class="input" id="reference" type="text" bind:value={reference}>
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="card-footer">
                    <button class="button card-footer-item" on:click|stopPropagation={yeetRequest}>Antrag stellen
                    </button>
                    <button class="button card-footer-item" on:click|stopPropagation={close}>Abbrechen</button>
                </footer>
            {/if}
        </div>
    </div>
    <button class="modal-close is-large" aria-label="close" on:click|stopPropagation={close}></button>
</div>
