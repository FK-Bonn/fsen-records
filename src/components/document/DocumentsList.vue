<script setup lang="ts">

import type {IBaseFsData, IDocumentData} from "@/interfaces";
import {useDocumentsStore} from "@/stores/documents";
import {computed, type ComputedRef} from "vue";
import SingleDocument from "@/components/document/SingleDocument.vue";

const props = defineProps<{
  baseData: IBaseFsData,
}>()

const documents = useDocumentsStore();
const documentsForFs: ComputedRef<IDocumentData[]> = computed(()=>documents.data ? documents.data[props.baseData.fs_id] :[]);
const budgets = computed(()=>documentsForFs.value.filter(value => value.base_name == 'HHP' || value.base_name.startsWith('NHHP')))
const balances = computed(()=>documentsForFs.value.filter(value => value.base_name == 'HHR'))
const cashAudits = computed(()=>documentsForFs.value.filter(value => value.base_name == 'KP'))
const proceedings = computed(()=>documentsForFs.value.filter(value => value.base_name == 'Prot'))
const electionResults = computed(()=>documentsForFs.value.filter(value => value.base_name == 'Wahlergebnis'))
</script>

<template>
  <div class="card-content">
    <div class="content">
      <h3 class="heading is-3">Haushaltspläne</h3>
      <template v-if="budgets.length > 0">
        <ul>
          <li v-for="document in budgets" :key="document.filename">
            <SingleDocument :document="document" :fsId="baseData.fs_id"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>

      <h3 class="heading is-3">Haushaltsrechnungen</h3>
      <template v-if="balances.length > 0">
        <ul>
          <li v-for="document in balances" :key="document.filename">
            <SingleDocument :document="document" :fsId="baseData.fs_id"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>

      <h3 class="heading is-3">Kassenprüfungen</h3>
      <template v-if="cashAudits.length > 0">
        <ul>
          <li v-for="document in cashAudits" :key="document.filename">
            <SingleDocument :document="document" :fsId="baseData.fs_id"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>

      <h3 class="heading is-3">Protokolle</h3>
      <template v-if="proceedings.length > 0">
        <ul>
          <li v-for="document in proceedings" :key="document.filename">
            <SingleDocument :document="document" :fsId="baseData.fs_id"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>

      <h3 class="heading is-3">Wahlergebnisse</h3>
      <template v-if="electionResults.length > 0">
        <ul>
          <li v-for="document in electionResults" :key="document.filename">
            <SingleDocument :document="document" :fsId="baseData.fs_id"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>

    </div>
  </div>
</template>

<style scoped>
li {
  list-style: none;
}
</style>