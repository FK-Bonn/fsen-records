<script setup lang="ts">
import type {IBaseFsData, INewPayoutRequestData} from "@/interfaces";
import FsDataSection from "@/components/fsdata/FsDataSection.vue";
import {computed} from "vue";
import CurrentlyCanBePaidSection from "@/components/studentbody/CurrentlyCanBePaidSection.vue";
import SemesterSection from "@/components/studentbody/SemesterSection.vue";
import BfsgSection from "@/components/studentbody/BfsgSection.vue";
import DocumentsSection from "@/components/studentbody/DocumentsSection.vue";
import IconPeople from "@/components/icons/IconPeople.vue";
import {usePageSettingsStore} from "@/stores/pageSettings";
import CompactStudentBody from "@/components/studentbody/CompactStudentBody.vue";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {getCurrentAndPastSemesters, semestersToIntervals} from "@/util";

const props = defineProps<{
  baseData: IBaseFsData,
}>()

const settings = usePageSettingsStore();
const payoutRequests = usePayoutRequestStore();

const shouldDisplay = (value: INewPayoutRequestData) => settings.displayAllAfsgSemesters ? true : !['ÜBERWIESEN', 'FAILED'].includes(value.status)

const semesters = computed(() => {
  const relevantSemesters = payoutRequests.afsg?.get(props.baseData.fs_id)?.filter(shouldDisplay).map((value) => value.semester) || []
  const requiredSemesters = getCurrentAndPastSemesters(new Date(), 6, relevantSemesters);
  return semestersToIntervals(requiredSemesters);
})

</script>

<template>
  <template v-if="settings.compactMode">
    <CompactStudentBody :baseData="baseData"/>
  </template>
  <template v-else>
    <li class="full-student-body">
      <div class="box">
        <h2 class="title is-2" :id="baseData.fs_id">
          <a :href="'#'+baseData.fs_id">
            <IconPeople/>
          </a>
          {{ baseData.name }}
        </h2>

      <div class="box">
        <FsDataSection :baseData="baseData"/>
      </div>

        <CurrentlyCanBePaidSection :baseData="baseData"/>

        <SemesterSection v-for="semester in semesters" :semester="semester" :baseData="baseData"
                         :key="semester?.start.toString()"/>

        <BfsgSection :baseData="baseData"/>

        <DocumentsSection :baseData="baseData"/>

      </div>
    </li>
  </template>
</template>

<style scoped>
.full-student-body .box {
  margin-bottom: 1rem;
}

.column {
  padding: 0;
}

</style>