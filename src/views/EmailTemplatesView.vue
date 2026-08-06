<script setup lang="ts">

import {onBeforeMount, ref, useTemplateRef} from "vue";
import {loadEmailTemplates, saveEmailTemplate, updatePageTitle} from "@/util";
import {useTokenStore} from "@/stores/token";
import type {IEmailTemplateDataWithMeta, IEmailTemplateMeta, IMonthDay} from "@/interfaces";
import SingleTemplate from "@/components/mails/SingleTemplate.vue";

const token = useTokenStore();

const templates = ref<null | IEmailTemplateDataWithMeta[]>(null);

const templateId = ref<string>('');
const targetFSK = ref<boolean>(false);
const targetContact = ref<boolean>(false);
const targetFinances = ref<boolean>(false);
const targetFSL = ref<boolean>(false);
const fixedDates = ref<IMonthDay[]>([]);
const daysBefore = ref<null | number>(null);
const frequency = ref<null | string>(null);
const subject = ref<string>('');
const body = ref<string>('');
const showForm = ref<boolean>(false);
const form = useTemplateRef('form')

const loadTemplates = () => {
  loadEmailTemplates(token.token()).then(value => templates.value = value);
};

const save = async () => {
  const targets = [];
  if (targetFSK.value) {
    targets.push('fsk');
  }
  if (targetFSL.value) {
    targets.push('fsl');
  }
  if (targetContact.value) {
    targets.push('kontakt');
  }
  if (targetFinances.value) {
    targets.push('finanzen');
  }
  const data = {
    template_id: templateId.value,
    meta: {
      fixed_dates: fixedDates.value || null,
      days_before: daysBefore.value || null,
      frequency: frequency.value,
      targets: targets,
    },
    subject: subject.value,
    body: body.value,
  }
  await saveEmailTemplate(data, token.token());
  loadTemplates();
  showForm.value = false;
}
const load = (template: IEmailTemplateDataWithMeta) => {
  templateId.value = template.template_id;
  subject.value = template.subject;
  body.value = template.body;
  targetFinances.value = template.meta.targets.includes('finanzen');
  targetFSK.value = template.meta.targets.includes('fsk');
  targetFSL.value = template.meta.targets.includes('fsl');
  targetContact.value = template.meta.targets.includes('kontakt');
  fixedDates.value = template.meta.fixed_dates || [];
  daysBefore.value = template.meta.days_before;
  frequency.value = template.meta.frequency;
  showForm.value = true;
  setTimeout(() => form.value?.scrollIntoView(), 100)
}

const clear = () => {
  templateId.value = "";
  subject.value = "";
  body.value = "";
  targetFinances.value = false;
  targetFSK.value = false;
  targetFSL.value = false;
  targetContact.value = false;
  fixedDates.value = [];
  daysBefore.value = null;
  frequency.value = null;
  showForm.value = true;
}

const abort = () => {
  clear();
  showForm.value = false;
}

const addFixedDate = () => {
  fixedDates.value.push({day: 31, month: 12});
}
const removeFixedDate = (index: number) => {
  const values = [...fixedDates.value];
  values.splice(index, 1);
  fixedDates.value = values;
}

onBeforeMount(() => {
  updatePageTitle('E-Mail-Vorlagen');
  loadTemplates();
});
</script>

<template>
  <div class="section">

    <h1 class="title is-1">E-Mail-Vorlagen</h1>

    <table class="table">
      <thead>
      <tr>
        <th>ID</th>
        <th>Meta</th>
        <th>Betreff</th>
        <th>Letzte Änderung</th>
        <th></th>
      </tr>
      </thead>
      <tbody v-if="templates">
      <template v-for="template in templates" :key="template.template_id">
        <SingleTemplate :template="template" @load="load"/>
      </template>
      </tbody>
      <tbody v-else>
      <tr>
        <td colspan="5">Wird geladen…</td>
      </tr>
      </tbody>
    </table>


    <button class="button" @click="clear">Neues Template anlegen</button>


    <div v-if="showForm">
      <hr>
      <div class="field" id="form" ref="form">
        <label class="label">Template-ID</label>
        <div class="control">
          <input class="input" type="text" placeholder="template_id" v-model="templateId">
        </div>
      </div>

      <div class="field">
        <label class="label">Adressat*innen</label>
        <div class="checkboxes">
          <label class="checkbox">
            <input type="checkbox" v-model="targetFSK"/>
            FSK
          </label>

          <label class="checkbox">
            <input type="checkbox" v-model="targetContact"/>
            kontakt
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="targetFSL"/>
            fsl
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="targetFinances"/>
            finanzen
          </label>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Fixe Daten</label>
            <table class="table">
              <thead>
              <tr>
                <th>Monat</th>
                <th>Tag</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, i) in fixedDates">
                <td><input class="input" type="number" placeholder="0" v-model="row.month"></td>
                <td><input class="input" type="number" placeholder="0" v-model="row.day"></td>
                <td>
                  <button class="button" @click="removeFixedDate(i)">x</button>
                </td>
              </tr>
              <tr>
                <td colspan="3">
                  <button class="button" @click="addFixedDate">Eintrag hinzufügen</button>
                </td>
              </tr>
              </tbody>
            </table>

          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">Frequenz</label>
            <div class="control">
              <div class="select">
                <select v-model="frequency">
                  <option :value="null">–</option>
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich (Montag)</option>
                  <option value="monthly">Monatlich (1.)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="column">
          <div class="field">
            <label class="label">Option: Tage vorher</label>
            <div class="control">
              <input class="input" type="number" placeholder="0" v-model="daysBefore">
            </div>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Betreff</label>
        <div class="control">
          <input class="input" type="text" placeholder="Betreff hier eingeben…" v-model="subject">
        </div>
      </div>

      <div class="field">
        <label class="label">Inhalt</label>
        <div class="control">
          <textarea class="textarea" placeholder="Liebe Fachschaft {fs_name}, …" v-model="body"></textarea>
        </div>
      </div>
      <button class="button is-primary" @click="save">Speichern</button>
      <button class="button" @click="abort">Abbrechen</button>
    </div>
  </div>
</template>
