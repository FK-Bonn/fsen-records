<script setup lang="ts">

import {computed, type ComputedRef, type Ref, ref} from "vue";
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import {annotateDocument, uploadDocument} from "@/util";
import ReferencesEditor from "@/components/document/ReferencesEditor.vue";
import AnnotationsEditor from "@/components/document/AnnotationsEditor.vue";
import type {IAnnotation, IDocumentReference} from "@/interfaces";
import TagListInput from "@/components/document/TagListInput.vue";

const props = defineProps<{
  fs: string,
  category: string,
  requestId: string,
}>()

const emit = defineEmits<{
  reloadDocuments: []
}>()

const token = useTokenStore();
const account = useAccountStore();

const file: Ref<File | null> = ref(null);
const fileInput: Ref<any | null> = ref(null);
const base_name = ref('');
const error: Ref<string | null> = ref(null);
const success: Ref<string | null> = ref(null);

const tags = ref('');
const annotateError: Ref<string | null> = ref(null);
const annotateSuccess: Ref<string | null> = ref(null);

const annotations: Ref<IAnnotation[]> = ref([]);

const mandatoryFields: ComputedRef<boolean> = computed(() => {
  return !!base_name.value;
});

const basename = (filename: string) => filename.substring(0, filename.lastIndexOf('.'));

const onFileSelected = (x: Event) => {
  const element = x.target as HTMLInputElement;
  if (element.files) {
    file.value = element.files[0];
    base_name.value = basename(file.value.name);
  }
}

const upload = () => {
  error.value = null;
  success.value = null;
  annotateError.value = null;
  annotateSuccess.value = null;
  if (file.value && mandatoryFields.value) {
    const target: IDocumentReference = {
      category: props.category,
      request_id: props.requestId,
      base_name: base_name.value,
      date_start: null,
      date_end: null,
    }
    uploadDocument(props.fs, file.value, props.category, base_name.value, null,
        null, props.requestId, token.token()).catch(reason => {
      error.value = 'Ein Fehler beim Hochladen ist aufgetreten: ' + reason.json();
    }).then(() => {
      success.value = 'Upload erfolgreich';
      file.value = null;
      if (fileInput.value) {
        fileInput.value.value = null;
      }

      if (!account.user?.admin) {
        return;
      }

      const annotationsData = annotations.value;
      const tagsData = tags.value.length ? tags.value.split(',').map(value => value.trim()) : null;
      return annotateDocument(props.fs, target, annotationsData, tagsData, null, null, token.token());
    }).then(() => {
      annotateSuccess.value = 'Annotation erfolgreich';
      annotations.value = [];
      tags.value = '';
      emit('reloadDocuments');
    }).catch(reason => {
      annotateError.value = 'Ein Fehler beim Annotieren ist aufgetreten: ' + reason.json();
    })
  } else {
    error.value = 'Bitte alle Pflichtfelder ausfüllen!'
  }
}
</script>

<template>
  <div class="card-content mb-5">
    <div class="content">
      <form class="box">
        <details>
          <summary>Neues Dokument hochladen</summary>

          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Datei</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="file is-normal has-name">
                  <label class="file-label">
                    <input class="file-input" type="file" accept=".pdf" ref="fileInput" @change="onFileSelected"/>
                    <span class="file-cta">
                      <span class="file-icon">
                        <i class="fas fa-upload"></i>
                      </span>
                      <span class="file-label"> Datei auswählen… </span>
                    </span>
                    <span class="file-name">{{ file?.name }}</span>
                  </label>
                </div>
                <p class="help">Maximale Dateigröße: 5 MiB</p>
              </div>
            </div>
          </div>

          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Art/Beschreibung der Datei</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input class="input" type="text" placeholder="Rechnung xyz" v-model="base_name">
                </div>
              </div>
            </div>
          </div>

          <div class="notification is-success" v-if="success">
            {{ success }}
          </div>
          <div class="notification is-danger" v-if="error">
            {{ error }}
          </div>
          <template v-if="account.user?.admin">
            <hr>

            <TagListInput type="BFSG/VORANKUENDIGUNG" v-model="tags"/>

            <h5>Annotationen</h5>
            <AnnotationsEditor v-model="annotations"/>


            <div class="notification is-success" v-if="annotateSuccess">
              {{ annotateSuccess }}
            </div>
            <div class="notification is-danger" v-if="annotateError">
              {{ annotateError }}
            </div>
          </template>
          <button class="button is-primary" @click.prevent="upload">Hochladen</button>
        </details>
      </form>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  margin-left: 0;
}

h5 {
  margin: 1rem 0 .5rem 0;
}
</style>