<script setup lang="ts">

import {useRoute} from "vue-router";
import {computed, onMounted, ref, type Ref} from "vue";
import type {IFullPayoutRequestData} from "@/interfaces";
import {deletePayoutRequest, getPayoutRequestData, getPayoutRequestHistory} from "@/util";
import {useTokenStore} from "@/stores/token";
import PayoutRequestTable from "@/components/payoutrequest/PayoutRequestTable.vue";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {useFixedDateStore} from "@/stores/fixedDate";

const route = useRoute();
const token = useTokenStore();
const payoutRequests = usePayoutRequestStore();
const fixedDate = useFixedDateStore();


const completedRequest: Ref<IFullPayoutRequestData[] | null> = ref(null);
const message: Ref<string | null> = ref(null);
const requestId = route.params.requestId as string;
const type_ = computed(() => requestId.startsWith('A') ? 'afsg' : requestId.startsWith('B') ? 'bfsg' : requestId.startsWith('V') ? 'vorankuendigung' : 'error');

const loadHistory = () => {
  getPayoutRequestHistory(requestId, type_.value, token.token())
      .then(data => {
        if (data) {
          completedRequest.value = data;
        }
      }).catch(reason => message.value = reason);
}

const sendDelete = () => {
  deletePayoutRequest(requestId, type_.value, token.token())
      .then(result => {
        if (result === null) {
          message.value = 'Ups, das hat nicht funktioniert';
          return
        }
        message.value = result;
        if (type_.value === 'afsg') {
          getPayoutRequestData('afsg', fixedDate.date)
              .then(data => {
                payoutRequests.afsg = data;
              });
        }
        if (type_.value === 'bfsg') {
          getPayoutRequestData('bfsg', fixedDate.date)
              .then(data => {
                payoutRequests.bfsg = data;
              });
        }
        if (type_.value === 'vorankuendigung') {
          getPayoutRequestData('vorankuendigung', fixedDate.date)
              .then(data => {
                payoutRequests.vorankuendigung = data;
              });
        }
      }).catch(reason => message.value = reason);
}

onMounted(() => {
  loadHistory();
})

</script>

<template>
  <div class="section">
    <h1 class="title is-1">Antrag {{ requestId }} löschen</h1>

    <template v-if="message">
      <p>{{ message }} 😵‍💫</p>
    </template>
    <template v-else-if="completedRequest">
      <p class="mb-2" v-if="completedRequest.length < 2">Soll dieser Antrag gelöscht werden?</p>
      <p class="mb-2" v-else>Soll dieser Antragszustand gelöscht werden?
        Er hat noch {{ completedRequest.length - 1 }} Vorgängerversion(en).</p>

      <PayoutRequestTable :payoutRequest="completedRequest[0]" :previous="null"/>

      <button @click="sendDelete" class="button is-danger">Löschen</button>
    </template>
    <template v-else>
      <p>Daten werden geladen…</p>
    </template>

  </div>
</template>

<style scoped>

</style>