<script setup lang="ts">

import type {IDocumentData, IDocumentHistoryData} from "@/interfaces";
import {getDocumentHistory, toReference} from "@/util";
import {onMounted, ref, type Ref} from "vue";
import {useTokenStore} from "@/stores/token";
import DocumentTable from "@/components/document/DocumentTable.vue";

const props = defineProps<{
  fs: string,
  document: IDocumentData,
}>()

const historyModal = defineModel<boolean>({required: true})

const token = useTokenStore();

const completedRequest: Ref<IDocumentHistoryData[] | null> = ref(null);
const message = ref('');


const close = () => {
  historyModal.value = false;
}


const loadHistory = () => {
  getDocumentHistory(props.fs, toReference(props.document), token.apiToken)
      .then(data => {
        if (data) {
          completedRequest.value = data;
        }
      }).catch(reason => message.value = reason);
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
            Bearbeitungsverlauf des Dokuments
          </p>
        </header>
        <div class="card-content">
          <div class="content">
            <pre>{{ JSON.stringify(toReference(document)) }}</pre>
            <article v-if="message" class="message">
              <div class="message-body">
                {{ message }}
              </div>
            </article>
            <template v-else-if="completedRequest">
                <table class="table">
              <template v-for="(documentState, i) in completedRequest" :key="i">
                <DocumentTable
                    :document="documentState"
                    :previous="i===(completedRequest.length-1)?null:completedRequest[i+1]"
                />
                <tr><td colspan="4" class="has-background-grey"></td></tr>
              </template>
                </table>
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
.modal-content {
  width: auto;
  max-width: 90%;
}
</style>