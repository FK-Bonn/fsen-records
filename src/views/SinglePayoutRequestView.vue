<script setup lang="ts">

import {useRoute} from "vue-router";
import {computed, onMounted, ref, type Ref, watch} from "vue";
import type {IFullPayoutRequestData} from "@/interfaces";
import {deletePayoutRequest, getPayoutRequestData, getPayoutRequestHistory, payoutRequestToMarkdown} from "@/util";
import {useTokenStore} from "@/stores/token";
import PayoutRequestTable from "@/components/payoutrequest/PayoutRequestTable.vue";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {useFixedDateStore} from "@/stores/fixedDate";
import RequestEditModal from "@/components/payoutrequest/RequestEditModal.vue";
import {useAccountStore} from "@/stores/account";

const route = useRoute();
const token = useTokenStore();
const account = useAccountStore();
const payoutRequests = usePayoutRequestStore();

const completedRequest: Ref<IFullPayoutRequestData[] | null> = ref(null);
const message: Ref<string | null> = ref(null);
const requestId = route.params.requestId as string;
const type_ = computed(() => requestId.startsWith('A') ? 'afsg' : requestId.startsWith('B') ? 'bfsg' : requestId.startsWith('V') ? 'vorankuendigung' : 'error');
const editModal = ref(false);
const thisPayoutRequest = computed(() => {
  let requests = null;
  if (type_.value === "afsg") {
    requests = payoutRequests.afsg;
  }
  if (type_.value === "bfsg") {
    requests = payoutRequests.bfsg;
  }
  if (type_.value === "vorankuendigung") {
    requests = payoutRequests.vorankuendigung;
  }
  if (requests) {
    for (const [fs_id, fs_requests] of requests) {
      for (const request of fs_requests) {
        if (request.request_id === requestId) {
          return request;
        }
      }
    }
  }
  return null;
})


const loadHistory = () => {
  getPayoutRequestHistory(requestId, type_.value, token.token())
      .then(data => {
        if (data) {
          completedRequest.value = data;
        }
      }).catch(reason => message.value = reason);
}

const showEditModal = () => {
  editModal.value = true;
}

onMounted(() => {
  loadHistory();
})

watch(thisPayoutRequest, async () => {
  loadHistory();
})

</script>

<template>
  <div class="section">
    <h1 class="title is-1">Antrag {{ requestId }}</h1>

    <h2 class="title is-2">Aktueller Antrag</h2>

    <template v-if="thisPayoutRequest">

      <button v-if="account.user?.admin" class="button is-small" @click.stop="showEditModal" title="Antrag bearbeiten">
        ✏️
      </button>

      <PayoutRequestTable :payoutRequest="thisPayoutRequest" :previous="null"/>
    </template>

    <hr>

    <template v-if="message">
      <p>{{ message }} 😵‍💫</p>
    </template>
    <template v-else-if="completedRequest">
      <h2 class="title is-2">Bearbeitungsverlauf</h2>

      <template v-for="(requestState, i) in completedRequest" :key="i">
        <PayoutRequestTable
            :payoutRequest="requestState"
            :previous="i===(completedRequest.length-1)?null:completedRequest[i+1]"
        />
        <RouterLink v-if="account.user?.admin && i === 0"
                    :to="{name: 'delete-request', params: {requestId: requestId}}">
          <small>😵 Aktuelle Version dieses Antrags löschen</small>
        </RouterLink>
        <hr>
      </template>

      <template v-if="editModal && completedRequest[0]">
        <RequestEditModal :payoutRequest="completedRequest[0]" :type="type_" v-model="editModal"/>
      </template>

    </template>
    <template v-else>
      <p>Daten werden geladen…</p>
    </template>

  </div>
</template>

<style scoped>

</style>