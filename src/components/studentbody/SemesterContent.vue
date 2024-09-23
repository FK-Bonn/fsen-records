<script setup lang="ts">

import {usePageSettingsStore} from "@/stores/pageSettings";
import {computed} from "vue";
import type {IBaseFsData} from "@/interfaces";
import {type Interval, SemesterCalculator} from "@/Calculator";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import RelevantDocumentsWithProceedings from "@/components/document/RelevantDocumentsWithProceedings.vue";
import IconCross from "@/components/icons/IconCross.vue";
import {useDocumentsStore} from "@/stores/documents";
import SingleDocument from "@/components/document/SingleDocument.vue";

const props = defineProps<{
  baseData: IBaseFsData,
  semester: Interval
}>()

const settings = usePageSettingsStore();
const documents = useDocumentsStore();

const calculator = computed(() => new SemesterCalculator(props.baseData, props.semester, documents.data));
const mostRecentElection = computed(() => calculator.value.getMostRecentElection());
</script>

<template>
  <div class="card-content">
    <div class="content">
      <RelevantDocumentsWithProceedings
          title="Haushaltspläne"
          proceedingsTitle="Beschluss"
          :overallLevel="calculator.getBudgetLevel()"
          :documents="calculator.getRelevantBudgets()"
          :covered="calculator.isSemesterCoveredByBudgets()"
          :baseData="baseData"/>

      <h5 class="title is-5">
        <IconForLevel :level="calculator.getBalanceLevel()"/>
        Haushaltsrechnungen
      </h5>
      <ul :class="('documents level-'+calculator.getBalanceLevel()) + (settings.paleLowerDocuments ? 'pale' : '')">
        <li v-if="calculator.getRelevantBalances().length > 0 && !calculator.isSemesterCoveredByBalances()">
          <IconCross/>
          Semester nicht vollständig abgedeckt
        </li>
        <template v-for="balance in calculator.getRelevantBalances()" :key="balance.filename">
          <li class="document level-{VerdictCalculator.getWorstAnnotationLevel(balance.annotations)}">
            <SingleDocument :document="balance" :baseData="baseData"/>
          </li>
        </template>
        <li v-if="calculator.getRelevantBalances().length === 0">
          <IconCross/>
          Fehlt!
        </li>
      </ul>

      <RelevantDocumentsWithProceedings
          title="Kassenprüfungen"
          proceedingsTitle="Wahl der Kassenprüfer*innen"
          :overallLevel="calculator.getCashAuditLevel()"
          :documents="calculator.getRelevantCashAudits()"
          :covered="calculator.isSemesterCoveredByCashAudits()"
          :baseData="baseData"/>

      <h5 class="title is-5">
        <IconForLevel :level="calculator.getElectionLevel()"/>
        Wahlergebnis
      </h5>
      <SingleDocument v-if="mostRecentElection" :document="mostRecentElection" :baseData="baseData"/>
      <template v-else>
        <IconCross/>
        Fehlt!
      </template>
    </div>
  </div>
</template>

<style scoped>
h5.title {
  border-bottom: 1px solid #ccc;
  border-image: linear-gradient(90deg, #ccc, #fff) 1;
  padding-bottom: .2em;
  padding-top: .3em;
  margin: 0 0 .5em 0;
}

ul, ul:not(:last-child) {
  margin-top: 0;
  margin-left: 0;
  list-style: none !important;
}

.pale.documents.level-Ok .document.level-Warning,
.pale.documents.level-Ok .document.level-Error,
.pale.documents.level-Warning .document.level-Error {
  opacity: 0.3;
}
</style>