<script setup lang="ts">

import type {IDocumentData, IDocumentReference} from "@/interfaces";
import {annotateDocument, deleteDocument, getDocumentData, shortenFilename} from "@/util";
import {computed, ref, type Ref} from "vue";
import {useTokenStore} from "@/stores/token";
import ReferencesEditor from "@/components/document/ReferencesEditor.vue";
import AnnotationsEditor from "@/components/document/AnnotationsEditor.vue";
import {useDocumentsStore} from "@/stores/documents";
import {useFixedDateStore} from "@/stores/fixedDate";
import {Interval} from "@/Calculator";
import DateRange from "@/components/DateRange.vue";
import DocumentName from "@/components/document/DocumentName.vue";
import {usePageSettingsStore} from "@/stores/pageSettings";

const props = defineProps<{
  fs: string,
  document: IDocumentData,
}>()

const deleteModal = defineModel<boolean>({required: true})

const token = useTokenStore();
const documents = useDocumentsStore();
const fixedDate = useFixedDateStore();
const settings = usePageSettingsStore();

const message: Ref<string | null> = ref(null);

const close = () => {
  deleteModal.value = false;
}

const reloadDocuments = () => {
  getDocumentData(fixedDate.date).then(value => {
    documents.data = value;
  })
}

const yeetRequest = () => {
  const target: IDocumentReference = {
    category: 'AFSG',
    request_id: '',
    base_name: props.document.base_name,
    date_start: props.document.date_start || null,
    date_end: props.document.date_end || null,
  }
  return deleteDocument(props.fs, target, token.apiToken).then(() => {
    message.value = 'Datei(version) gelöscht';
    reloadDocuments();
  }).catch(reason => {
    message.value = 'Ein Fehler beim Löschen ist aufgetreten: ' + reason;
  })
}


const shortenedFilename = computed(() => shortenFilename(props.document?.filename))
</script>

<template>
  <div class="modal is-active" @click.stop>
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Datei(version) löschen
          </p>
        </header>
        <template v-if="message">
          <div class="card-content">
            <div class="content">
              <template v-if="settings.showFilenames">
                <code>{{ shortenedFilename }}</code>
                (
                <DateRange :interval="Interval.fromStrings(document.date_start, document.date_end || document.date_start)"/>
                )
              </template>
              <DocumentName v-else :document="document"/>

              <hr>

              <article class="message">
                <div class="message-body">
                  {{ message }}
                </div>
              </article>
            </div>
          </div>
          <footer class="card-footer">
            <button class="button card-footer-item" @click.stop="close">Schließen</button>
          </footer>
        </template>
        <template v-else>
          <div class="card-content">
            <div class="content">
              <template v-if="settings.showFilenames">
                <code>{{ shortenedFilename }}</code>
                (
                <DateRange :interval="Interval.fromStrings(document.date_start, document.date_end || document.date_start)"/>
                )
              </template>
              <DocumentName v-else :document="document"/>
            </div>
          </div>
          <footer class="card-footer">
            <button class="button card-footer-item is-danger" @click.stop="yeetRequest">Löschen</button>
            <button class="button card-footer-item" @click.stop="close">Abbrechen</button>
          </footer>
        </template>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click.stop="close"></button>
  </div>
</template>

<style scoped>
h5 {
  margin: 1rem 0 .5rem 0;
}
</style>