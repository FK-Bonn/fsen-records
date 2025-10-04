<script setup lang="ts">
import type {IBaseFsData} from "@/interfaces";
import {computed} from "vue";
import {CurrentlyCanBePaidCalculator, Interval, VerdictCalculator} from "@/Calculator";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import IconCheckmark from "@/components/icons/IconCheckmark.vue";
import IconCross from "@/components/icons/IconCross.vue";
import DateRange from "@/components/DateRange.vue";
import RelevantDocumentsWithProceedings from "@/components/document/RelevantDocumentsWithProceedings.vue";
import {usePageSettingsStore} from "@/stores/pageSettings";
import SingleDocument from "@/components/document/SingleDocument.vue";
import {useDocumentsStore} from "@/stores/documents";
import {useFixedDateStore} from "@/stores/fixedDate";

const props = defineProps<{
  baseData: IBaseFsData,
}>()

const settings = usePageSettingsStore();
const documents = useDocumentsStore();
const fixedDate = useFixedDateStore();

const calculator = computed(() => new CurrentlyCanBePaidCalculator(props.baseData, fixedDate.date, documents.data));
const mostRecentElection = computed(() => calculator.value.getMostRecentElection());
const mostRecentInauguralMeetingProceedings = computed(() => calculator.value.getProceedingsOfMostRecentInauguralMeeting());
const mostRecentBudgetAsArray = computed(() => {
  const budget = calculator.value.getMostRecentBudgetForCurrentFinancialYear();
  return budget ? [budget] : []
})
</script>

<template>
  <div class="card-content">
    <div class="content">
      <h5 class="title is-5">
        <IconForLevel :level="calculator.getElectionLevel()"/>
        Letzte Wahl
      </h5>
      <ul v-if="mostRecentElection">
        <li>
          <template v-if="calculator.isMostRecentElectionYoungerThanOneYear()">
            <IconCheckmark/>
            Innerhalb der letzten 12 Monate
          </template>
          <template v-else>
            <IconCross/>
            Nicht innerhalb der letzten 12 Monate
          </template>
        </li>
        <li>
          <SingleDocument :document="mostRecentElection" :fsId="baseData.fs_id"/>
        </li>
      </ul>
      <template v-else>
        <IconCross/>
        Fehlt!
      </template>

      <h5 class="title is-5">
        <IconForLevel :level="calculator.getProceedingsOfLastInauguralMeetingLevel()"/>
        Letzte konstituierende Sitzung
      </h5>
      <ul v-if="mostRecentInauguralMeetingProceedings">
        <li>
          <IconForLevel
              :level="calculator.areProceedingsOfLastInauguralMeetingYoungerThanLastElectionLevel(mostRecentInauguralMeetingProceedings)"/>
          <DateRange
              :interval="Interval.fromStrings(mostRecentInauguralMeetingProceedings?.date_start,
                mostRecentInauguralMeetingProceedings?.date_start)"/>
          nach letzter Wahl?
        </li>
        <li>
          <SingleDocument :document="mostRecentInauguralMeetingProceedings" :fsId="baseData.fs_id"/>
        </li>
      </ul>
      <template v-else>
        <IconCross/>
        Fehlt!
      </template>

      <RelevantDocumentsWithProceedings
          title="Letzter beschlossener Haushaltsplan des aktuellen Haushaltsjahres"
          proceedingsTitle="Beschluss"
          :overallLevel="calculator.getCurrentFinancialYearBudgetLevel()"
          :documents="mostRecentBudgetAsArray"
          :covered="calculator.isCurrentFinanicalYearCoveredByBudgets()"
          :baseData="baseData"/>

      <RelevantDocumentsWithProceedings
          title="Haushaltsplan des vorherigen Haushaltsjahres"
          proceedingsTitle="Beschluss"
          :overallLevel="calculator.getPreviousFinancialYearBudgetLevel()"
          :documents="calculator.getRelevantBudgetsForPreviousFinancialYear()"
          :covered="calculator.isPreviousFinanicalYearCoveredByBudgets()"
          :baseData="baseData"/>

      <h5 class="title is-5">
        <IconForLevel :level="calculator.getBalanceLevel()"/>
        Haushaltsrechnung des vorherigen Haushaltsjahres
      </h5>
      <ul :class="('documents level-'+calculator.getBalanceLevel())+ (settings.paleLowerDocuments ? ' pale' : '')">
        <template v-for="balance in calculator.getRelevantBalancesForPreviousFinancialYear()" :key="balance.filename">
          <li :class="'document level-'+VerdictCalculator.getWorstAnnotationLevel(balance.annotations)">
            <SingleDocument :document="balance" :fsId="baseData.fs_id"/>
          </li>
        </template>
        <template v-if="calculator.getRelevantBalancesForPreviousFinancialYear().length === 0">
          <li>
            <IconCross/>
            Fehlt!
          </li>
        </template>
      </ul>

      <RelevantDocumentsWithProceedings
          title="Kassenprüfungen über das vorherige Haushaltsjahr"
          proceedingsTitle="Wahl der Kassenprüfer*innen"
          :overallLevel="calculator.getCashAuditLevel()"
          :documents="calculator.getRelevantCashAuditsForPreviousFinancialYear()"
          :covered="calculator.isPreviousFinancialYearCoveredByCashAudits()"
          :baseData="baseData"/>
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