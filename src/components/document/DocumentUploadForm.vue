<script setup lang="ts">

import {computed, type ComputedRef, type Ref, ref} from "vue";
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import {annotateDocument, uploadDocument} from "@/util";
import ReferencesEditor from "@/components/document/ReferencesEditor.vue";
import AnnotationsEditor from "@/components/document/AnnotationsEditor.vue";
import type {IAnnotation, IDocumentReference} from "@/interfaces";

const props = defineProps<{
  fs: string,
}>()

const emit = defineEmits<{
  reloadDocuments: []
}>()

const token = useTokenStore();
const account = useAccountStore();

const file: Ref<File | null> = ref(null);
const fileInput: Ref<any | null> = ref(null);
const base_name = ref('Prot');
const date_start: Ref<string | null> = ref(null);
const date_end: Ref<string | null> = ref(null);
const error: Ref<string | null> = ref(null);
const success: Ref<string | null> = ref(null);

const tags = ref('');
const url = ref('');
const annotateError: Ref<string | null> = ref(null);
const annotateSuccess: Ref<string | null> = ref(null);

const references: Ref<IDocumentReference[]> = ref([]);
const annotations: Ref<IAnnotation[]> = ref([]);

const mandatoryFields: ComputedRef<boolean> = computed(() => {
  if (!base_name.value) {
    return false;
  }
  if (base_name.value == 'Prot') {
    return !!date_start.value;
  }
  if (base_name.value == 'HHP') {
    return !!(date_start.value && date_end.value);
  }
  if (base_name.value == 'HHR') {
    return !!(date_start.value && date_end.value);
  }
  if (base_name.value == 'KP') {
    return !!(date_start.value && date_end.value);
  }
  if (base_name.value == 'Wahlergebnis') {
    return !!date_start.value;
  }
  return false;
});

const showDateEnd = computed(() => {
  return ['HHP', 'HHR', 'KP', 'Wahlergebnis'].includes(base_name.value);
});

const showUrl = computed(() => {
  return ['Wahlergebnis'].includes(base_name.value);
});


const addTag = (tag: string) => {
  const items = tags.value.split(',').map(value => value.trim());
  if (!items.includes(tag)) {
    items.push(tag);
  }
  tags.value = items.filter(value => value !== '').join(', ');
}


const onFileSelected = (x: Event) => {
  const element = x.target as HTMLInputElement;
  if (element.files) {
    file.value = element.files[0];
  }
}

const upload = () => {
  error.value = null;
  success.value = null;
  annotateError.value = null;
  annotateSuccess.value = null;
  if (file.value && mandatoryFields) {
    const target: IDocumentReference = {
      category: 'AFSG',
      request_id: '',
      base_name: base_name.value,
      date_start: date_start.value,
      date_end: showDateEnd.value ? date_end.value : null,
    }
    uploadDocument(props.fs, file.value, 'AFSG', base_name.value, date_start.value,
        showDateEnd.value ? date_end.value : null, null, token.apiToken).catch(reason => {
      error.value = 'Ein Fehler beim Hochladen ist aufgetreten: ' + reason;
    }).then(() => {
      success.value = 'Upload erfolgreich';
      file.value = null;
      if (fileInput.value) {
        fileInput.value.value = null;
      }
      date_start.value = null;
      date_end.value = null;

      const annotationsData = annotations.value;
      const tagsData = tags.value.length ? tags.value.split(',').map(value => value.trim()) : null;
      const referencesData = references.value.length ? references.value : null;
      const urlData = url.value ? url.value : null;
      return annotateDocument(props.fs, target, annotationsData, tagsData, referencesData, urlData, token.apiToken);
    }).then(() => {
      annotateSuccess.value = 'Annotation erfolgreich';
      annotations.value = [];
      tags.value = '';
      references.value = [];
      url.value = '';
      emit('reloadDocuments');
    }).catch(reason => {
      annotateError.value = 'Ein Fehler beim Annotieren ist aufgetreten: ' + reason;
    })
  } else {
    error.value = 'Bitte alle Pflichtfelder ausfüllen!'
  }
}
</script>

<template>
  <div class="card-content" v-if="account?.user?.admin">
    <div class="content">
      <form class="box has-background-light">
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
              </div>
            </div>
          </div>

          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Art der Datei</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <div class="select">
                    <select v-model="base_name">
                      <option value="Prot">Protokoll</option>
                      <option value="HHP">Haushaltsplan</option>
                      <option value="HHR">Haushaltsrechnung</option>
                      <option value="KP">Kassenprüfung</option>
                      <option value="Wahlergebnis">Wahlergebnis</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">(Start-)Datum</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input class="input" type="date" placeholder="YYYY-MM-DD" v-model="date_start">
                </div>
              </div>
            </div>
          </div>

          <div class="field is-horizontal" v-if="showDateEnd">
            <div class="field-label is-normal">
              <label class="label">End-Datum</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input class="input" type="date" placeholder="YYYY-MM-DD" v-model="date_end">
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

          <hr>

          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">Schlagwörter</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input class="input" type="text" placeholder="HHP, Wahl KP, … (optional)" v-model="tags">
                </div>
                <p class="help">
                  <button class="button is-small" @click.prevent="()=>addTag('Konsti')" title="Konstituierende Sitzung">
                    Konsti
                  </button>
                  <button class="button is-small" @click.prevent="()=>addTag('HHP')" title="Haushaltsplan">HHP</button>
                  <button class="button is-small" @click.prevent="()=>addTag('NHHP')"
                          title="Nachtragshaushaltsplan">NHHP</button>
                  <button class="button is-small" @click.prevent="()=>addTag('NHHP2')"
                          title="Nachtragshaushaltsplan">NHHP2</button>
                  <button class="button is-small" @click.prevent="()=>addTag('Wahl KP')"
                          title="Wahl von Kassenprüfer*innen">Wahl KP
                  </button>
                </p>
              </div>
            </div>
          </div>

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
          <ReferencesEditor :fs="fs" v-model="references"/>

          <h5>Annotationen</h5>
          <AnnotationsEditor v-model="annotations"/>


          <div class="notification is-success" v-if="annotateSuccess">
            {{ annotateSuccess }}
          </div>
          <div class="notification is-danger" v-if="annotateError">
            {{ annotateError }}
          </div>

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