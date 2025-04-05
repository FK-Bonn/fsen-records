<script setup lang="ts">

import type {IElectionDataWithMeta} from "@/interfaces";
import {getElectionHistory} from "@/util";
import {onMounted, ref, type Ref} from "vue";
import {useTokenStore} from "@/stores/token";
import ElectionDisplay from "@/components/elections/ElectionDisplay.vue";

const props = defineProps<{
  electionId: string,
}>()

const historyModal = defineModel<boolean>({required: true})

const token = useTokenStore();

const completedRequest: Ref<IElectionDataWithMeta[] | null> = ref(null);
const message = ref('');


const close = () => {
  historyModal.value = false;
}


const loadHistory = () => {
  getElectionHistory(props.electionId, token.apiToken)
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
            Bearbeitungsverlauf
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
              <template v-for="(electionState, i) in completedRequest" :key="i">
                <div class="box">
                  <ElectionDisplay :election="electionState"/>
                </div>
                Timestamp: <code>{{electionState.last_modified_timestamp}}</code>
                , User: <code>{{electionState.last_modified_by}}</code>
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