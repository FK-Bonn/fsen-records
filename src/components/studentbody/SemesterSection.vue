<script setup lang="ts">

import {usePageSettingsStore} from "@/stores/pageSettings";
import {computed, ref} from "vue";
import type {IStudentBody} from "@/interfaces";
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
import {useScieboDataStore} from "@/stores/scieboData";
import {useDocumentsStore} from "@/stores/documents";

const props = defineProps<{
  studentBody: IStudentBody,
  semester: Interval
}>()

const settings = usePageSettingsStore();
const payoutRequests = usePayoutRequestStore();
const sciebo = useScieboDataStore();
const documents = useDocumentsStore();

const opened = ref(false);

const calculateLevel = (studentBody: IStudentBody, semester: Interval) => {
  const calculator = new SemesterCalculator(studentBody, semester, documents.data);
  return calculator.calculateOverallLevel();
}

const toggle = () => {
  opened.value = !opened.value;
}
const semesterName = computed(() => calculateSemesterName(props.semester))
const semesterId = computed(() => calculateSemesterId(props.semester))
const payoutRequestForSemester = computed(() => payoutRequests.afsg?.get(props.studentBody.id)?.find(value => value.semester === semesterId.value))
const budgetTitle = computed(() => semesterId.value ? sciebo.data?.budgetTitles[semesterId.value] : null)
const level = computed(() => calculateLevel(props.studentBody, props.semester))
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
                         :fsName="studentBody.name"
                         :fsId="studentBody.id"
                         :budgetTitle="budgetTitle"
                         :semester="semester"/>
          <button class="card-header-icon" aria-label="more options">
            <AngleIndicator :opened="opened"/>
          </button>
      </header>
      <SemesterContent v-if="opened" :studentBody="studentBody" :semester="semester"/>
    </div>
  </template>
</template>

<style scoped>
.card-header {
  cursor: pointer;
}

</style>