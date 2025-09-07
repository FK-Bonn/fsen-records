<script setup lang="ts">

import type {IFullPayoutRequestData, INewPayoutRequestData} from "@/interfaces";
import {editPayoutRequest, formatIsoDate, getPayoutRequestData, parseCommentFields} from "@/util";
import {computed, ref, type Ref, watch} from "vue";
import {useTokenStore} from "@/stores/token";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestTable from "@/components/payoutrequest/PayoutRequestTable.vue";
import RequestStatusOptions from "@/components/payoutrequest/RequestStatusOptions.vue";

const props = defineProps<{
  payoutRequest: INewPayoutRequestData | IFullPayoutRequestData,
  type: string,
}>()

const editModal = defineModel<boolean>({required: true})

const token = useTokenStore();
const payoutRequests = usePayoutRequestStore();
const parsedComment = parseCommentFields(props.payoutRequest.comment);

const status = ref(props.payoutRequest.status);
const status_date = ref(props.payoutRequest.status_date);
const amount_cents = ref(props.payoutRequest.amount_cents);
const title = ref(parsedComment.title);
const description = ref(parsedComment.description);
const participantscount = ref(parsedComment.participantscount);
const fid = ref(parsedComment.fid);
const comment = ref(parsedComment.comment);
const completion_deadline = ref(props.payoutRequest.completion_deadline);
const reference = ref(props.payoutRequest.reference);

const completedRequest: Ref<IFullPayoutRequestData | null> = ref(null);
const message: Ref<string | null> = ref(null);


const close = () => {
  editModal.value = false;
}

const setStatusDateToToday = () => {
  const today = new Date();
  status_date.value = formatIsoDate(today);
}

watch(status, async () => {
  setStatusDateToToday();
})

const yeetRequest = () => {
  const baseData = {
    status: status.value,
    status_date: status_date.value,
    amount_cents: amount_cents.value,
    comment: comment.value,
    completion_deadline: completion_deadline.value,
    reference: reference.value,
  };
  const data = props.type !== 'bfsg' ? baseData : {
    ...baseData,
    comment: JSON.stringify({
      title: title.value,
      description: description.value,
      participantscount: participantscount.value,
      fid: fid.value,
      comment: comment.value,
    })
  }
  editPayoutRequest(props.payoutRequest.request_id, props.type, data, token.token()).then(value => {
    if (value) {
      message.value = value.message;
      completedRequest.value = value.payoutRequest;
      reloadPayoutRequestData();
    }
  })
}

const locale = 'de-DE'
const numDecimals = 2;
const formatter = new Intl.NumberFormat(locale, {maximumFractionDigits: numDecimals});

const valueFormatted = computed(() => formatter.format(amount_cents.value / 100));

function moneyInputHandler(e: KeyboardEvent) {
  const eventTarget = e.currentTarget as HTMLInputElement;
  const tempValue = parseNumber(eventTarget.value);
  if (isNaN(tempValue)) {
    amount_cents.value = 0;
    return;
  }
  amount_cents.value = Math.round(tempValue * 100);
}

const parseNumber = (value: string) => {
  return parseFloat(value.replace(/[^\d,]/, '').replace(',', '.'))
}

const reloadPayoutRequestData = () => {
  if (props.type === 'afsg') {
    getPayoutRequestData(props.type)
        .then(data => {
          payoutRequests.afsg = data;
        });
  } else if (props.type === 'bfsg') {
    getPayoutRequestData(props.type)
        .then(data => {
          payoutRequests.bfsg = data;
        });
  } else if (props.type === 'vorankuendigung') {
    getPayoutRequestData(props.type)
        .then(data => {
          payoutRequests.vorankuendigung = data;
        });
  }
}

</script>

<template>
  <div class="modal is-active" @click.stop>
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            {{ type.toUpperCase() }}-Antrag {{ payoutRequest.request_id }} bearbeiten
          </p>
        </header>
        <template v-if="completedRequest || message">
          <div class="card-content">
            <div class="content">
              <article class="message">
                <div class="message-body">
                  {{ message }}
                </div>
              </article>
              <PayoutRequestTable v-if="completedRequest" :payoutRequest="completedRequest" :previous="null"/>
            </div>
          </div>
          <footer class="card-footer">
            <button class="button card-footer-item" @click.stop="close">Schließen</button>
          </footer>
        </template>
        <template v-else>
          <div class="card-content">
            <div class="content">
              <table class="table is-narrow">
                <tbody>
                <tr>
                  <th>Fachschaft</th>
                  <td>{{ payoutRequest.fs }}</td>
                </tr>
                <tr>
                  <th>Semester</th>
                  <td>{{ payoutRequest.semester }}</td>
                </tr>
                <tr>
                  <th>Antragsnummer</th>
                  <td>{{ payoutRequest.request_id }}</td>
                </tr>
                <tr>
                  <th>Kategorie</th>
                  <td>{{ payoutRequest.category }}</td>
                </tr>
                <tr>
                  <th>Antragsdatum</th>
                  <td>{{ payoutRequest.request_date }}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    <select class="select" v-model="status">
                      <RequestStatusOptions :type="payoutRequest.type"/>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>Status-Datum</th>
                  <td>
                    <input class="input" type="date" v-model="status_date">
                  </td>
                </tr>
                <tr>
                  <th>Betrag</th>
                  <td>
                    <input class="input" :value="valueFormatted" @keyup="moneyInputHandler">
                  </td>
                </tr>
                <template v-if="props.type !== 'afsg'">
                  <tr>
                    <th>Titel</th>
                    <td>
                      <input class="input" type="text" v-model="title">
                    </td>
                  </tr>
                  <tr>
                    <th>Beschreibung</th>
                    <td>
                      <textarea class="textarea" type="text" v-model="description"></textarea>
                    </td>
                  </tr>
                  <tr>
                    <th>Anzahl Teilnehmende</th>
                    <td>
                      <input class="input" type="number" v-model.number="participantscount">
                    </td>
                  </tr>
                  <tr>
                    <th>FID zur Abstimmung</th>
                    <td>
                      <input class="input" type="text" v-model="fid">
                    </td>
                  </tr>
                </template>
                <tr>
                  <th>Kommentar</th>
                  <td>
                    <textarea class="textarea" type="text" rows="2" v-model="comment"></textarea>
                  </td>
                </tr>
                <tr>
                  <th>Frist zur Vervollständigung</th>
                  <td>
                    <input class="input" type="date" v-model="completion_deadline">
                  </td>
                </tr>
                <tr>
                  <th>Referenz</th>
                  <td>
                    <input class="input" type="text" v-model="reference">
                  </td>
                </tr>
                <tr>
                  <th>Antrag gestellt von</th>
                  <td>{{
                      (('requester' in payoutRequest) ? (payoutRequest.requester || '(versteckt)') : '(versteckt)')
                    }}
                  </td>
                </tr>
                <tr>
                  <th>Zuletzt modifiziert am</th>
                  <td>{{
                      (('last_modified_timestamp' in payoutRequest) ? (payoutRequest.last_modified_timestamp || '(versteckt)') : '(versteckt)')
                    }}
                  </td>
                </tr>
                <tr>
                  <th>Zuletzt modifiziert von</th>
                  <td>{{
                      (('last_modified_by' in payoutRequest) ? (payoutRequest.last_modified_by || '(versteckt)') : '(versteckt)')
                    }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <footer class="card-footer">
            <button class="button card-footer-item" @click.stop="yeetRequest">Speichern</button>
            <button class="button card-footer-item" @click.stop="close">Abbrechen</button>
          </footer>
        </template>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click.stop="close"></button>
  </div>
</template>

<style scoped>

</style>