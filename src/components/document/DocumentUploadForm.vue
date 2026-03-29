<script setup lang="ts">

import {computed, type ComputedRef, type Ref, ref} from "vue";
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import {annotateDocument, getDocumentData, getDocumentHistory, uploadDocument} from "@/util";
import ReferencesEditor from "@/components/document/ReferencesEditor.vue";
import AnnotationsEditor from "@/components/document/AnnotationsEditor.vue";
import type {IAnnotation, IDocumentData, IDocumentHistoryData, IDocumentReference} from "@/interfaces";
import TagListInput from "@/components/document/TagListInput.vue";
import RelatedDocumentHeader from "@/components/document/RelatedDocumentHeader.vue";
import RelatedAnnotationList from "@/components/document/RelatedAnnotationList.vue";

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

const existingDocument: Ref<IDocumentHistoryData | null> = ref(null);
const relatedDocuments: Ref<IDocumentData[]> = ref([]);

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
  if (base_name.value.startsWith('NHHP')) {
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
  return ['HHP', 'HHR', 'KP', 'Wahlergebnis'].includes(base_name.value) || base_name.value.startsWith('NHHP');
});

const showUrl = computed(() => {
  return ['Wahlergebnis'].includes(base_name.value);
});

const onFileSelected = (x: Event) => {
  const element = x.target as HTMLInputElement;
  if (element.files) {
    file.value = element.files[0];
  }
}

const addAnnotation = (annotation: IAnnotation) => {
  annotations.value.push(annotation);
}

const addReference = (document: IDocumentData) => {
  references.value.push({
    "category": document.category,
    "request_id": document.request_id,
    "base_name": document.base_name,
    "date_start": document.date_start || null,
    "date_end": document.date_end || null,
  });
}

const resetStatus = () => {
  error.value = null;
  success.value = null;
  annotateError.value = null;
  annotateSuccess.value = null;
};

const resetUploadFields = () => {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = null;
  }
  date_start.value = null;
  date_end.value = null;
};

const resetAnnotationFields = () => {
  annotations.value = [];
  tags.value = '';
  references.value = [];
  url.value = '';
};

const buildTarget = (): IDocumentReference => ({
  category: 'AFSG',
  request_id: '',
  base_name: base_name.value,
  date_start: date_start.value,
  date_end: showDateEnd.value ? date_end.value : null,
});

const buildAnnotationPayload = () => ({
  annotationsData: annotations.value,
  tagsData: tags.value.length ? tags.value.split(',').map(v => v.trim()) : null,
  referencesData: references.value.length ? references.value : null,
  urlData: url.value || null,
});

const handleUploadError = (reasonPromise: Promise<any>) => {
  reasonPromise.then((reason: any) => {
    error.value = 'Ein Fehler beim Hochladen ist aufgetreten: ' + reason;
  });
  return Promise.reject(Promise.resolve('Upload fehlgeschlagen'));
};

const handleAnnotateError = (reasonPromise: Promise<any>) => {
  reasonPromise.then((reason: any) => {
    annotateError.value = 'Ein Fehler beim Annotieren ist aufgetreten: ' + reason;
  });
};

const upload = async () => {
  resetStatus();

  if (!file.value || !mandatoryFields.value) {
    error.value = 'Bitte alle Pflichtfelder ausfüllen!';
    return;
  }

  const target = buildTarget();
  const {annotationsData, tagsData, referencesData, urlData} = buildAnnotationPayload();

  await uploadDocument(
      props.fs, file.value, 'AFSG', base_name.value,
      date_start.value, target.date_end, null, token.token()
  )
      .catch(handleUploadError)
      .then(() => {
        success.value = 'Upload erfolgreich';
        resetUploadFields();
        return annotateDocument(props.fs, target, annotationsData, tagsData, referencesData, urlData, token.token());
      })
      .then(() => {
        annotateSuccess.value = 'Annotation erfolgreich';
        resetAnnotationFields();
        emit('reloadDocuments');
      })
      .catch(handleAnnotateError);
};

const showRelatedDocumentsPanel = computed(() => {
  return ['HHR', 'KP'].includes(base_name.value) || base_name.value.includes('HHP');
});

const fetchExistingDocuments = async () => {
  if (!mandatoryFields.value) {
    existingDocument.value = null;
    relatedDocuments.value = [];
    return;
  }
  try {
    const target = buildTarget();
    const history = await getDocumentHistory(props.fs, target, token.token());

    if (history && history.length > 0) {
      existingDocument.value = history[0];
    } else {
      existingDocument.value = null;
    }

    if (showRelatedDocumentsPanel.value) {
      const allDocuments = await getDocumentData(null, 'AFSG');
      const fsDocuments: IDocumentData[] = allDocuments[props.fs] ?? [];
      const isHhpType = base_name.value.includes('HHP');
      const isHhrType = base_name.value === 'HHR';
      const isKpType = base_name.value === 'KP';
      const currentDateStart = date_start.value;

      const twoYearsBefore = currentDateStart
          ? `${Number.parseInt(currentDateStart.substring(0, 4)) - 2}${currentDateStart.substring(4)}`
          : null;

      relatedDocuments.value = fsDocuments
          .filter(d => {
            if (existingDocument.value && d.filename === existingDocument.value.filename) {
              return false;
            }
            if (isHhpType) {
              if (!(d.base_name === 'HHP' || d.base_name.startsWith('NHHP') || d.base_name === 'HHR' || d.base_name === 'Prot')) {
                return false;
              }
            } else if (isHhrType) {
              if (!(d.base_name === 'HHR' || d.base_name === 'KP' || d.base_name === 'HHP' || d.base_name.startsWith('NHHP'))) {
                return false;
              }
            } else if (isKpType) {
              if (!(d.base_name === 'KP' || d.base_name === 'Prot')) {
                return false;
              }
            }
            if (date_end.value && d.date_start && d.date_start > date_end.value) {
              return false;
            }
            return !(twoYearsBefore && d.date_start && d.date_start < twoYearsBefore);
          })
          .sort((a, b) => {
            const dateCompare = (b.date_end ?? b.date_start ?? '').localeCompare(a.date_end ?? a.date_start ?? '');
            if (dateCompare !== 0) {
              return dateCompare;
            }
            return b.base_name.localeCompare(a.base_name);
          });
    } else {
      relatedDocuments.value = [];
    }
  } catch {
    existingDocument.value = null;
    relatedDocuments.value = [];
  }
};
</script>

<template>
  <div class="card-content" v-if="account?.user?.admin">
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
              <label class="label">Art der Datei</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <div class="select">
                    <select v-model="base_name" @change="fetchExistingDocuments">
                      <option value="Prot">Protokoll</option>
                      <option value="HHP">Haushaltsplan</option>
                      <option value="NHHP1">1. Nachtragshaushaltsplan</option>
                      <option value="NHHP2">2. Nachtragshaushaltsplan</option>
                      <option value="NHHP3">3. Nachtragshaushaltsplan</option>
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
                  <input class="input" type="date" placeholder="YYYY-MM-DD" v-model="date_start" @blur="fetchExistingDocuments">
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
                  <input class="input" type="date" placeholder="YYYY-MM-DD" v-model="date_end" @blur="fetchExistingDocuments">
                </div>
              </div>
            </div>
          </div>

          <div v-if="existingDocument" class="notification is-warning is-light">
            <strong>Bestehendes Dokument gefunden.</strong>
            Bitte Annotationen prüfen und falls nötig übernehmen.
          </div>

          <div class="notification is-success" v-if="success">{{ success }}</div>
          <div class="notification is-danger" v-if="error">{{ error }}</div>

          <template v-if="existingDocument">
            <h5>Gefundenes Dokument</h5>
            <RelatedDocumentHeader :document="existingDocument" :fs="props.fs"/>
            <h5>Bestehende Annotationen</h5>
            <RelatedAnnotationList :annotations="existingDocument.annotations" :on-adopt="addAnnotation"/>
            <hr>
          </template>

          <template v-if="relatedDocuments.length">
            <h5>Eventuell prüfungsrelevante Dokumente</h5>
            <div v-for="doc in relatedDocuments" :key="doc.filename" class="mb-4">
              <RelatedDocumentHeader :document="doc" :fs="props.fs" :on-reference="addReference"/>
              <RelatedAnnotationList :annotations="doc.annotations"/>
            </div>
            <hr>
          </template>

          <TagListInput type="AFSG" v-model="tags"/>

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


          <div class="notification is-success" v-if="annotateSuccess">{{ annotateSuccess }}</div>
          <div class="notification is-danger" v-if="annotateError">{{ annotateError }}</div>

          <button class="button is-primary mt-4" @click.prevent="upload">
            {{ existingDocument ? 'Überschreiben' : 'Hochladen' }}
          </button>
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

.file-name {
  display: flex;
}
</style>