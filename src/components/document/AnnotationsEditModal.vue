<script setup lang="ts">

import type {IDocumentData, IDocumentReference} from "@/interfaces";
import {annotateDocument, getDocumentData, shortenFilename} from "@/util";
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
import TagListInput from "@/components/document/TagListInput.vue";

const props = defineProps<{
  fs: string,
  document: IDocumentData,
}>()

const editModal = defineModel<boolean>({required: true})

const emit = defineEmits<{
  saved: []
}>()

const token = useTokenStore();
const documents = useDocumentsStore();
const fixedDate = useFixedDateStore();
const settings = usePageSettingsStore();

const tags = ref(props.document.tags ? props.document.tags.join(', ') : '');
const url = ref(props.document.url || '');
const references = ref([...props.document.references || []]);
const annotations = ref(JSON.parse(JSON.stringify(props.document.annotations)) || []);

const message: Ref<string | null> = ref(null);

const showUrl = computed(() => {
  return ['Wahlergebnis'].includes(props.document.base_name);
});

const close = () => {
  editModal.value = false;
}

const reloadDocuments = () => {
  getDocumentData(fixedDate.date).then(value => {
    documents.data = value;
  })
}

const yeetRequest = () => {
  const target: IDocumentReference = {
    category: props.document.category,
    request_id: props.document.request_id,
    base_name: props.document.base_name,
    date_start: props.document.date_start || null,
    date_end: props.document.date_end || null,
  }
  const annotationsData = annotations.value;
  const tagsData = tags.value.length ? tags.value.split(',').map(value => value.trim()) : null;
  const referencesData = references.value.length ? references.value : null;
  const urlData = url.value ? url.value : null;
  return annotateDocument(props.fs, target, annotationsData, tagsData, referencesData, urlData, token.token()).then(() => {
    message.value = 'Annotationen aktualisiert';
    reloadDocuments();
    emit('saved');
  }).catch(reason => {
    message.value = 'Ein Fehler beim Annotieren ist aufgetreten: ' + reason;
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
            Annotationen bearbeiten
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

              <hr>

              <TagListInput :type="document.category" v-model="tags"/>

              <div class="field is-horizontal" v-if="showUrl">
                <div class="field-label is-normal">
                  <label class="label">URL</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <div class="control">
                      <input class="input" type="text" placeholder="https://… (optional)" v-model="url">
                    </div>
                  </div>
                </div>
              </div>

              <h5>Referenzen</h5>
              <ReferencesEditor :fs="props.fs" v-model="references"/>

              <h5>Annotationen</h5>
              <AnnotationsEditor v-model="annotations"/>
            </div>
          </div>
          <footer class="card-footer">
            <button class="button card-footer-item" @click.stop="yeetRequest">Speichern</button>
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