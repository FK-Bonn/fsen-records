<script setup lang="ts">

import type {INewPayoutRequestData} from "@/interfaces";
import {createBfsgPayoutRequest, getPayoutRequestData} from "@/util";
import {computed, ref, type Ref} from "vue";
import {useTokenStore} from "@/stores/token";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestTable from "@/components/payoutrequest/PayoutRequestTable.vue";
import RequestCategoryOptions from "@/components/payoutrequest/RequestCategoryOptions.vue";
import ValidBFSGSemesters from "@/components/payoutrequest/ValidBFSGSemesters.vue";

const props = defineProps<{
  fsName: string,
  fsId: string,
}>()

const modal = defineModel<boolean>({required: true})

const token = useTokenStore();
const payoutRequests = usePayoutRequestStore();

const completedRequest: Ref<INewPayoutRequestData | null> = ref(null);
const message: Ref<null | string> = ref(null);

const semesterId = ref('');
const category = ref('');
const amount_cents = ref(0);
const title = ref('');
const description = ref('');
const participantscount: Ref<string | number> = ref('');
const reference = ref('');
const comment = ref('');


const close = () => {
  modal.value = false;
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
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
}

const missingFields = () => {
  const fieldNames = [];
  if (!semesterId.value) {
    fieldNames.push('Semester');
  }
  if (!category.value) {
    fieldNames.push('Kategorie');
  }
  if (!amount_cents.value) {
    fieldNames.push('Betrag');
  }
  if (!title.value) {
    fieldNames.push('Titel');
  }
  if (fieldNames.length > 0) {
    alert('Die folgenden Felder müssen mindestens noch ausgefüllt werden: ' + fieldNames.join(', '));
    return true;
  }
  return false;
}

const yeetRequest = () => {
  if (missingFields()) {
    return;
  }
  const commentField = JSON.stringify({
    title: title.value,
    description: description.value,
    participantscount: participantscount.value,
    fid: '',
    comment: comment.value,
  });
  createBfsgPayoutRequest(props.fsId, semesterId.value, category.value, amount_cents.value,
      commentField, reference.value, token.token()).then(value => {
    if (value) {
      message.value = value.message;
      completedRequest.value = value.payoutRequest;
      reloadPayoutRequestData();
    }
  })
}

const reloadPayoutRequestData = () => {
  getPayoutRequestData('bfsg')
      .then(data => {
        payoutRequests.bfsg = data;
      });
}
</script>

<template>
  <div class="modal is-active" @click.stop>
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            BFSG-Antrag stellen
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
              <template v-if="completedRequest">
                <p>
                  <RouterLink :to="{name: 'payout-request', params: {requestId: completedRequest.request_id}}">
                    Antrag öffnen, um Dateien hochzuladen
                  </RouterLink>
                </p>
                <PayoutRequestTable :payoutRequest="completedRequest" :previous="null"/>
              </template>
            </div>
          </div>
          <footer class="card-footer">
            <button class="button card-footer-item" @click.stop="close">Schließen</button>
          </footer>
        </template>
        <template v-else>
          <div class="card-content">
            <div class="content">
              <p>BFSG-Antrag für die Fachschaft <b>{{ fsName }}</b> stellen?</p>

              <div class="notification is-info">
                Nachdem der Antrag gestellt wurde, können Dokumente für den Antrag hochgeladen werden.
              </div>

              <div class="columns">
                <div class="column">
                  <div class="field">
                    <label class="label" for="semesterId">Semester*</label>
                    <div class="control">
                      <div class="select">
                        <select class="select" id="semesterId" v-model="semesterId">
                          <ValidBFSGSemesters/>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="column">
                  <div class="field">
                    <label class="label" for="category">Kategorie*</label>
                    <div class="control">
                      <div class="select">
                        <select class="select" id="category" v-model="category">
                          <RequestCategoryOptions/>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="label" for="valueFormatted">Betrag*</label>
                <div class="control">
                  <input class="input" id="valueFormatted" :value="valueFormatted" @keyup="moneyInputHandler">
                </div>
              </div>
              <div class="field">
                <label class="label" for="title">Titel*</label>
                <div class="control">
                  <input class="input" id="title" type="text" v-model="title">
                </div>
              </div>
              <div class="field">
                <label class="label" for="title">Beschreibung</label>
                <div class="control">
                  <textarea class="textarea" id="title" type="text" v-model="description" rows="3"></textarea>
                </div>
              </div>
              <div class="columns">
                <div class="column">
                  <div class="field">
                    <label class="label" for="participantscount">Anzahl Teilnehmende</label>
                    <div class="control">
                      <input class="input" id="participantscount" type="number" v-model.number="participantscount">
                    </div>
                  </div>
                </div>
                <div class="column">
                  <div class="field">
                    <label class="label" for="reference">Referenz/Vorankündigung</label>
                    <div class="control">
                      <input class="input" id="reference" type="text" v-model="reference">
                    </div>
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label" for="comment">Kommentar</label>
                <div class="control">
                  <textarea class="textarea" id="comment" type="text" v-model="comment" rows="2"></textarea>
                </div>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <button class="button card-footer-item" @click.stop="yeetRequest">Antrag stellen
            </button>
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