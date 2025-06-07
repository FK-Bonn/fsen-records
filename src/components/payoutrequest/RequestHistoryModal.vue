<script setup lang="ts">

import type {IFullPayoutRequestData} from "@/interfaces";
import {getPayoutRequestHistory} from "@/util";
import {onMounted, ref, type Ref} from "vue";
import {useTokenStore} from "@/stores/token";
import PayoutRequestTable from "@/components/payoutrequest/PayoutRequestTable.vue";

const props = defineProps<{
  type: string,
  payoutRequestId: string,
}>()

const historyModal = defineModel<boolean>({required: true})

const token = useTokenStore();

const completedRequest: Ref<IFullPayoutRequestData[] | null> = ref(null);
const message = ref('');


const close = () => {
  historyModal.value = false;
}


const loadHistory = () => {
  getPayoutRequestHistory(props.payoutRequestId, props.type, token.token())
      .then(data => {
        if (data) {
          completedRequest.value = data;
        }
      });
}

onMounted(() => {
  loadHistory();
})
</script>

<template>
  <div class="modal is-active" @click.stop>
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            {{ type.toUpperCase() }}-Antrag {{ payoutRequestId }}: Bearbeitungsverlauf
          </p>
        </header>
        <div class="card-content">
          <div class="content">
            <article v-if="message" class="message">
              <div class="message-body">
                {{ message }}
              </div>
            </article>
            <template v-else-if="completedRequest">
              <template v-for="(requestState, i) in completedRequest" :key="i">
                <PayoutRequestTable
                    :payoutRequest="requestState"
                    :previous="i===(completedRequest.length-1)?null:completedRequest[i+1]"
                />
                <hr>
              </template>
            </template>
            <template v-else>
              Daten werden geladen…
            </template>
          </div>
        </div>
        <footer class="card-footer">
          <button class="button card-footer-item" @click.stop="close">Schließen</button>
        </footer>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click.stop="close"></button>
  </div>
</template>

<style scoped>

</style>