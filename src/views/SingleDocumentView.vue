<script setup lang="ts">

import {useRoute} from "vue-router";
import {useDocumentsStore} from "@/stores/documents";
import {computed, type Ref, ref, watch} from "vue";
import SingleDocument from "@/components/document/SingleDocument.vue";
import {useAllFsData} from "@/stores/allFsData";
import DocumentName from "@/components/document/DocumentName.vue";
import {useTokenStore} from "@/stores/token";
import type {IDocumentData, IDocumentHistoryData, IDocumentReference} from "@/interfaces";
import {getDocumentHistory, isReferenced, refKey, toReference} from "@/util";
import DocumentTable from "@/components/document/DocumentTable.vue";
import FixedDateBanner from "@/components/FixedDateBanner.vue";
import SingleDocumentWithoutReferences from "@/components/document/SingleDocumentWithoutReferences.vue";

const route = useRoute();
const documentsStore = useDocumentsStore();
const allFsData = useAllFsData();
const token = useTokenStore();

const completedRequest: Ref<IDocumentHistoryData[] | null> = ref(null);
const message = ref('');
const filename = route.params.filename as string;

const loadHistory = (fsId: string, document: IDocumentData) => {
  getDocumentHistory(fsId, toReference(document), token.token())
      .then(data => {
        if (data) {
          completedRequest.value = data;
        }
      }).catch(reason => message.value = reason);

}

const getReferencedDocument = (fsId: string, reference: IDocumentReference): IDocumentData | null => {
  if (!documentsStore.data) {
    return null;
  }
  const documentsForFs = documentsStore.data[fsId];
  return documentsForFs.find(value => isReferenced(value, [reference])) || null;
}

const documentData = computed(() => {
  if (!documentsStore.data) {
    return null;
  }
  for (const fsId of Object.keys(documentsStore.data)) {
    for (const document of documentsStore.data[fsId]) {
      if (document.filename === filename) {
        return {fsId, document};
      }
    }
  }
  return null;
})
const fsName = computed(() => {
  if (!documentData.value || !allFsData.data) {
    return '?';
  }
  return allFsData.data[documentData.value.fsId].base?.data.name || '?';
})

watch(() => (documentData.value), async () => {
  if (documentData.value) {
    loadHistory(documentData.value.fsId, documentData.value.document);
  }
}, {immediate: true});


</script>

<template>
  <div class="container section">
    <FixedDateBanner/>

    <div class="content">

      <template v-if="documentData">
        <h2 class="title is-2">
          Fachschaft {{ fsName }}
        </h2>
        <h1 class="title is-1">
          <DocumentName :document="documentData.document"/>
        </h1>

        <h3 class="title is-3">Aktueller Zustand</h3>

        <div class="box">
          <SingleDocumentWithoutReferences :document="documentData.document" :fsId="documentData.fsId"/>
          <ul class="prots">
            <li v-for="reference in documentData.document.references" :key="refKey(reference)">
              <b>Referenz:</b><br>
              <SingleDocument :document="getReferencedDocument(documentData.fsId, reference)"
                              :fsId="documentData.fsId"/>
            </li>
          </ul>
        </div>

        <h3 class="title is-3">Historie</h3>

        <pre>{{ JSON.stringify(toReference(documentData.document)) }}</pre>
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
                  :fs="documentData.fsId"
              />
              <tr>
                <td colspan="4" class="has-background-grey"></td>
              </tr>
            </template>
          </table>
        </template>
        <template v-else>
          Daten werden geladen…
        </template>
      </template>
      <template v-else>
        <div class="notification is-danger">
          Das Dokument mit dem Dateinamen
          <code>{{ filename }}</code>
          konnte nicht (mehr) gefunden werden.
          Möglicherweise wurde es durch eine neuere Version ersetzt?
        </div>
      </template>

    </div>
  </div>
</template>

<style scoped>

</style>
