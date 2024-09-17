<script setup lang="ts">
import {type Ref, ref} from "vue";
import {useTokenStore} from "@/stores/token";
import {uploadProceedings} from "@/util";

const props = defineProps<{
  fs: string,
}>()

const emit = defineEmits<{
  reloadProceedings: []
}>()

const token = useTokenStore();

const file: Ref<File | null> = ref(null);
const fileInput: Ref<any | null> = ref(null);
const committee = ref('FSR');
const date: Ref<string | null> = ref(null);
const tags = ref('');
const error: Ref<string | null> = ref(null);
const success: Ref<string | null> = ref(null);

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
  if (file.value && committee.value && date.value) {
    uploadProceedings(props.fs, file.value, committee.value, date.value, tags.value, token.apiToken).then(() => {
      success.value = 'Upload erfolgreich';
      file.value = null;
      if (fileInput.value) {
        fileInput.value.value = null;
      }
      date.value = null;
      tags.value = '';
      emit('reloadProceedings');
    }).catch(reason => {
      error.value = 'Ein Fehler ist aufgetreten: ' + reason;
    })
  } else {
    error.value = 'Bitte alle Pflichtfelder ausfüllen!'
  }
}
</script>

<template>
  <form class="box has-background-light">
    <details>
      <summary>Neues Protokoll hochladen</summary>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">PDF-Datei</label>
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
          <label class="label">Gremium</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <div class="select">
                <select v-model="committee">
                  <option value="FSR">Fachschaftsrat (FSR)</option>
                  <option value="FSV">Fachschaftsvertretung (FSV)</option>
                  <option value="FSVV">Fachschaftsvollversammlung (FSVV)</option>
                  <option value="WVV">Wahlvollversammlung (WVV)</option>
                  <option value="WA">Wahlausschuss (WA)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Datum</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input class="input" type="date" placeholder="YYYY-MM-DD" v-model="date">
            </div>
          </div>
        </div>
      </div>

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
              <button class="button is-small" @click.prevent="()=>addTag('NHHP')" title="Nachtragshaushaltsplan">NHHP
              </button>
              <button class="button is-small" @click.prevent="()=>addTag('Wahl KP')"
                      title="Wahl von Kassenprüfer*innen">Wahl KP
              </button>
              <button class="button is-small" @click.prevent="()=>addTag('Satzung')" title="Satzung">Satzung</button>
              <button class="button is-small" @click.prevent="()=>addTag('Ordnung')" title="Ordnung">Ordnung</button>
            </p>
          </div>
        </div>
      </div>

      <div class="notification is-success" v-if="success">
        {{ success }}
      </div>
      <div class="notification is-danger" v-if="error">
        {{ error }}
      </div>

      <button class="button is-primary" @click.prevent="upload">Hochladen</button>
    </details>
  </form>
</template>

<style scoped>

summary {
  cursor: pointer;
}

details[open] summary {
  margin-bottom: 1rem;
}
</style>