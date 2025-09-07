<script setup lang="ts">

import type {INewPayoutRequestData} from "@/interfaces";
import {createVorankuendigungPayoutRequest, getPayoutRequestData} from "@/util";
import {computed, ref, type Ref} from "vue";
import {useTokenStore} from "@/stores/token";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestTable from "@/components/payoutrequest/PayoutRequestTable.vue";
import RequestStatusOptions from "@/components/payoutrequest/RequestStatusOptions.vue";
import RequestCategoryOptions from "@/components/payoutrequest/RequestCategoryOptions.vue";

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
const request_date = ref('');
const status = ref('');
const status_date = ref('');
const amount_cents = ref(0);
const title = ref('');
const description = ref('');
const participantscount: Ref<string | number> = ref('');
const fid = ref('');
const comment = ref('');
const completion_deadline = ref('');
const reference = ref('');


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
  return parseFloat(value.replace(/[^\d,]/, '').replace(',', '.'))
}

const yeetRequest = () => {
  const commentField = JSON.stringify({
    title: title.value,
    description: description.value,
    participantscount: participantscount.value,
    fid: fid.value,
    comment: comment.value,
  });
  createVorankuendigungPayoutRequest(props.fsId, semesterId.value, category.value, amount_cents.value, status.value, status_date.value,
      commentField, completion_deadline.value, reference.value, request_date.value, token.token()).then(value => {
    if (value) {
      message.value = value.message;
      completedRequest.value = value.payoutRequest;
      reloadPayoutRequestData();
    }
  })
}

const reloadPayoutRequestData = () => {
  getPayoutRequestData('vorankuendigung')
      .then(data => {
        payoutRequests.vorankuendigung = data;
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
            Vorankündigung stellen
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
              Vorankündigung für die Fachschaft <b>{{ fsName }}</b> stellen?
              <div class="columns">
                <div class="column">
                  <div class="field">
                    <label class="label" for="semesterId">Semester*</label>
                    <div class="control">
                      <div class="select">
                        <select class="select" id="semesterId" v-model="semesterId">
                          <option value='2024-WiSe'>2024-WiSe</option>
                          <option value='2025-SoSe'>2025-SoSe</option>
                          <option value='2025-WiSe'>2025-WiSe</option>
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
              <div class="columns">
                <div class="column">
                  <div class="field">
                    <label class="label" for="status">Status</label>
                    <div class="control">
                      <select class="select" id="status" v-model="status">
                        <RequestStatusOptions type="vorankuendigung"/>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="column">
                  <div class="field">
                    <label class="label" for="statusDate">Status-Datum</label>
                    <div class="control">
                      <input class="input" id="statusDate" type="date" v-model="status_date">
                    </div>
                  </div>
                </div>
                <div class="column">
                  <div class="field">
                    <label class="label" for="requestDate">Antragsdatum</label>
                    <div class="control">
                      <input class="input" id="requestDate" type="date" v-model="request_date">
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
                <label class="label" for="title">Titel</label>
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
                    <label class="label" for="fid">FID zur Abstimmung</label>
                    <div class="control">
                      <input class="input" id="fid" type="text" v-model="fid">
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
              <div class="columns">
                <div class="column">
                  <div class="field">
                    <label class="label" for="reference">Referenz</label>
                    <div class="control">
                      <input class="input" id="reference" type="text" v-model="reference">
                    </div>
                  </div>
                </div>
                <div class="column">
                  <div class="field">
                    <label class="label" for="completionDeadline">Frist zur Vervollständigung</label>
                    <div class="control">
                      <input class="input" id="completionDeadline" type="date" v-model="completion_deadline">
                    </div>
                  </div>
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