<script setup lang="ts">

import type {IBaseFsData} from "@/interfaces";

const data = defineModel<IBaseFsData>({required: true})

const removeFinancialYearOverride = () => {
  data.value.financial_year_override = null;
}
const addFinancialYearOverride = () => {
  data.value.financial_year_override = {
    previous: {date_start: '', date_end: ''},
    current: {date_start: '', date_end: ''}
  };
}

const addProcUrl = () => {
  data.value.proceedings_urls.push({url: '', annotation: ''});
}

const removeProcUrl = (i: number) => {
  data.value.proceedings_urls.splice(i, 1);
}

</script>

<template>
  <dl>
    <dt>ID</dt>
    <dd><input class="input" v-model="data.fs_id" disabled/></dd>
    <dt>Name</dt>
    <dd><input class="input" v-model="data.name"/></dd>
    <dt>Fachschaftssatzung</dt>
    <dd><input class="input" v-model="data.statutes"/></dd>
    <dt>Beginn des Haushaltsjahres</dt>
    <dd><input class="input" v-model="data.financial_year_start"/></dd>
    <dt>Abweichende Haushaltsjahre</dt>
    <dd>
      <template v-if="data.financial_year_override">
        <dl>
          <dt>Aktuelles HHJ – Start</dt>
          <dd><input class="input" v-model="data.financial_year_override.current.date_start"/></dd>
          <dt>Aktuelles HHJ – Ende</dt>
          <dd><input class="input" v-model="data.financial_year_override.current.date_end"/></dd>
          <dt>Vorheriges HHJ – Start</dt>
          <dd><input class="input" v-model="data.financial_year_override.previous.date_start"/></dd>
          <dt>Vorheriges HHJ – Ende</dt>
          <dd><input class="input" v-model="data.financial_year_override.previous.date_end"/></dd>
        </dl>
        <button class="button" @click.prevent="removeFinancialYearOverride">Entfernen</button>
      </template>
      <template v-else>
        <button class="button" @click.prevent="addFinancialYearOverride">Hinzufügen</button>
      </template>
    </dd>
    <dt>Sitzungsprotokoll-URLs</dt>
    <dd>
      <template v-for="(procurl, i) in data.proceedings_urls" :key="i">
        <dl>
          <dt>URL</dt>
          <dd><input class="input" v-model="data.proceedings_urls[i].url"/></dd>
          <dt>Annotation (optional)</dt>
          <dd><input class="input" v-model="data.proceedings_urls[i].annotation"/></dd>
          <dt></dt>
          <dd>
            <button class="button" @click.prevent="removeProcUrl(i)">Entfernen</button>
          </dd>
        </dl>
      </template>
      <button class="button" @click.prevent="addProcUrl">Hinzufügen</button>
    </dd>
    <dt>Anmerkung</dt>
    <dd><input class="input" v-model="data.annotation"/></dd>
    <dt>Aktiv?</dt>
    <dd><input type="checkbox" v-model="data.active" disabled/></dd>
  </dl>
</template>

<style scoped>

</style>