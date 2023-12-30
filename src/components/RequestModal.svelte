<script type="ts">
    import {calculateSemesterId, calculateSemesterName, createPayoutRequest, getPayoutRequestData} from "../util";
    import type {Interval} from "../Calculator";
    import {afsgPayoutRequestData, token} from "../stores";
    import type {INewPayoutRequestData} from "../Interfaces";
    import PayoutRequestTable from "./PayoutRequestTable.svelte";

    export let fsName: string = '';
    export let fsId: string = '';
    export let modal: boolean = true;
    export let semester: Interval;
    let completedRequest: INewPayoutRequestData | null = null;
    let message = '';
    $: semesterName = calculateSemesterName(semester);
    $: semesterId = calculateSemesterId(semester);


    const close = (e) => {
        modal = false;
    }

    const yeetRequest = () => {
        createPayoutRequest(fsId, semesterId, $token).then(value => {
            message = value.message;
            completedRequest = value.payoutRequest;
            reloadPayoutRequestData();
        })
    }

    const reloadPayoutRequestData = () => {
        getPayoutRequestData('afsg')
            .then(data => {
                $afsgPayoutRequestData = data;
            });
    }
</script>
<div class="modal is-active" on:click|stopPropagation>
    <div class="modal-background"></div>
    <div class="modal-content">
        <div class="card">
            <header class="card-header">
                <p class="card-header-title">
                    AFSG-Antrag stellen
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
                        AFSG-Antrag für die Fachschaft
                        <b>{fsName}</b>
                        für das Semester
                        <b>{semesterName}</b>
                        stellen?
                    </div>
                </div>
                <footer class="card-footer">
                    <button class="button card-footer-item" on:click|stopPropagation={yeetRequest}>Antrag stellen</button>
                    <button class="button card-footer-item" on:click|stopPropagation={close}>Abbrechen</button>
                </footer>
            {/if}
        </div>
    </div>
    <button class="modal-close is-large" aria-label="close" on:click|stopPropagation={close}></button>
</div>
