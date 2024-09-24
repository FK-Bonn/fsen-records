<script setup lang="ts">

import {usePageSettingsStore} from "@/stores/pageSettings";
import {computed, ref} from "vue";
import type {IBaseFsData} from "@/interfaces";
import {type Interval, SemesterCalculator} from "@/Calculator";
import {calculateSemesterId, calculateSemesterName, shouldDisplayStar} from "@/util";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import DateRange from "@/components/DateRange.vue";
import DeadlineIcons from "@/components/icons/DeadlineIcons.vue";
import IconStar from "@/components/icons/IconStar.vue";
import AngleIndicator from "@/components/icons/AngleIndicator.vue";
import SemesterContent from "@/components/studentbody/SemesterContent.vue";
import PayoutRequest from "@/components/payoutrequest/PayoutRequest.vue";
import {useDocumentsStore} from "@/stores/documents";
import {META} from "@/meta";

const props = defineProps<{
  baseData: IBaseFsData,
  semester: Interval
}>()

const settings = usePageSettingsStore();
const payoutRequests = usePayoutRequestStore();
const documents = useDocumentsStore();

const opened = ref(false);

const calculateLevel = (baseData: IBaseFsData, semester: Interval) => {
  const calculator = new SemesterCalculator(baseData, semester, documents.data);
  return calculator.calculateOverallLevel();
}

const toggle = () => {
  opened.value = !opened.value;
}
const semesterName = computed(() => calculateSemesterName(props.semester))
const semesterId = computed(() => calculateSemesterId(props.semester))
const payoutRequestForSemester = computed(() => payoutRequests.afsg?.get(props.baseData.fs_id)?.find(value => value.semester === semesterId.value))
const budgetTitle = computed(() => semesterId.value ? META.budgetTitles[semesterId.value] : null)
const level = computed(() => calculateLevel(props.baseData, props.semester))
const displayStar = computed(() => shouldDisplayStar(level.value, payoutRequestForSemester.value))
</script>

<template>
  <template v-if="(!settings.showOnlySemestersWithPayoutRequests && !settings.showOnlySemestersWithStar)
|| (displayStar)
|| (!settings.showOnlySemestersWithStar && settings.showOnlySemestersWithPayoutRequests && payoutRequestForSemester)">
    <div class="card">
      <header class="card-header" @click="toggle">
        <p class="card-header-title">
          <IconForLevel :level="level"/>
            {{semesterName}}
            (
            <DateRange :interval="semester"/>)
              <DeadlineIcons :interval="semester"/>
        </p>
        <IconStar v-if="displayStar"/>
          <PayoutRequest :payoutRequest="payoutRequestForSemester"
                         :fsName="baseData.name"
                         :fsId="baseData.fs_id"
                         :budgetTitle="budgetTitle"
                         :semester="semester"/>
          <button class="card-header-icon" aria-label="more options">
            <AngleIndicator :opened="opened"/>
          </button>
      </header>
      <SemesterContent v-if="opened" :baseData="baseData" :semester="semester"/>
    </div>
  </template>
</template>

<style scoped>
.card-header {
  cursor: pointer;
}

</style>