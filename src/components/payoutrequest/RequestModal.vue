<script setup lang="ts">

import type {INewPayoutRequestData} from "@/interfaces";
import {Interval} from "@/Calculator";
import {calculateSemesterId, calculateSemesterName, createPayoutRequest, getPayoutRequestData} from "@/util";
import {computed, ref, type Ref} from "vue";
import {useTokenStore} from "@/stores/token";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestTable from "@/components/payoutrequest/PayoutRequestTable.vue";

const props = defineProps<{
  fsName: string,
  fsId: string,
  semester: Interval,
}>()

const modal = defineModel<boolean>({required: true})

const token = useTokenStore();
const payoutRequests = usePayoutRequestStore();

const completedRequest: Ref<INewPayoutRequestData | null> = ref(null);
const message: Ref<null | string> = ref(null);
const semesterName = computed(() => calculateSemesterName(props.semester));
const semesterId = computed(() => calculateSemesterId(props.semester));


const close = () => {
  modal.value = false;
}

const yeetRequest = () => {
  createPayoutRequest(props.fsId, semesterId.value, token.apiToken).then(value => {
    if (value) {
      message.value = value.message;
      completedRequest.value = value.payoutRequest;
      reloadPayoutRequestData();
    }
  })
}

const reloadPayoutRequestData = () => {
  getPayoutRequestData('afsg')
      .then(data => {
        payoutRequests.afsg = data;
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
            AFSG-Antrag stellen
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
              AFSG-Antrag für die Fachschaft
              <b>{{ fsName }}</b>
              für das Semester
              <b>{{ semesterName }}</b>
              stellen?
            </div>
          </div>
          <footer class="card-footer">
            <button class="button card-footer-item" @click.stop="yeetRequest">Antrag stellen</button>
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