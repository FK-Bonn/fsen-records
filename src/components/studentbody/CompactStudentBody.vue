<script setup lang="ts">
import type {IBaseFsData, INewPayoutRequestData} from "@/interfaces";
import {computed} from "vue";
import {CurrentlyCanBePaidCalculator, SemesterCalculator} from "@/Calculator";
import IconPeople from "@/components/icons/IconPeople.vue";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import {calculateSemesterId, getCurrentAndPastSemesters, semestersToIntervals} from "@/util";
import {useFixedDateStore} from "@/stores/fixedDate";
import {useDocumentsStore} from "@/stores/documents";
import {usePageSettingsStore} from "@/stores/pageSettings";
import {usePayoutRequestStore} from "@/stores/payoutRequest";

const props = defineProps<{
  baseData: IBaseFsData,
}>()

const fixedDate = useFixedDateStore();
const documents = useDocumentsStore();
const settings = usePageSettingsStore();
const payoutRequests = usePayoutRequestStore();

const calculator = computed(() => new CurrentlyCanBePaidCalculator(props.baseData, fixedDate.date, documents.data));

const shouldDisplay = (value: INewPayoutRequestData) => settings.displayAllAfsgSemesters ? true : !['ÜBERWIESEN', 'FAILED'].includes(value.status)

const semesters = computed(() => {
  const relevantSemesters = payoutRequests.afsg?.get(props.baseData.fs_id)?.filter(shouldDisplay).map((value) => value.semester) || []
  const requiredSemesters = getCurrentAndPastSemesters(new Date(), 6, relevantSemesters);
  return semestersToIntervals(requiredSemesters).reverse();
})

</script>

<template>
  <li>
    <div class="box">
      <div class="columns">
        <div class="column">
          <h2 class="title is-5" :id="baseData.fs_id">
            <a :href="'#'+baseData.fs_id">
              <IconPeople/>
            </a>
            {{ baseData.name }}
          </h2>
        </div>
        <div class="column is-narrow">
          <template v-for="semester in semesters" :key="semester?.start">
            <IconForLevel v-if="semester"
                          :level="new SemesterCalculator(baseData, semester, documents.data).calculateOverallLevel()"
                          :title="calculateSemesterId(semester)"/>
          </template>
          |
          <IconForLevel :level="calculator.calculateOverallLevel()" title="Auszahlungsfähigkeit"/>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.column {
  padding: 0;
}
</style>