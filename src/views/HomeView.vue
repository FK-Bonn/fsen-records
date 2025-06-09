<script setup lang="ts">
import TopLegend from "@/components/TopLegend.vue";
import StudentBody from "@/components/studentbody/StudentBody.vue";
import {nextTick, onBeforeMount, watch} from "vue";
import {AnnotationLevel, type IBaseFsData, type INewPayoutRequestData} from "@/interfaces";
import FilterSettings from "@/components/FilterSettings.vue";
import {CurrentlyCanBePaidCalculator, SemesterCalculator} from "@/Calculator";
import {scrollToHashIfPresent, semesterToInterval, shouldDisplayStar, updatePageTitle} from "@/util";
import {usePageSettingsStore} from "@/stores/pageSettings";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import FixedDateBanner from "@/components/FixedDateBanner.vue";
import {useRouter} from "vue-router";
import {useAllFsData} from "@/stores/allFsData";
import {useDocumentsStore} from "@/stores/documents";

const fsData = useAllFsData();
const payoutRequests = usePayoutRequestStore();
const documents = useDocumentsStore();
const settings = usePageSettingsStore();
const router = useRouter();

const redirectToDiffIfNecessary = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('diff')) {
    const dateStart = urlParams.get('dateStart') || '';
    const dateEnd = urlParams.get('dateEnd') || '';
    router.push({name: 'diff', params: {dateStart, dateEnd}, hash: window.location.hash});
  }
}

const anySemesterHasStar = (baseData: IBaseFsData, payoutRequests: Map<string, INewPayoutRequestData> | null) => {
  if (!baseData || !payoutRequests) {
    return false;
  }
  for (let payoutRequest of payoutRequests.values()) {
    const semester = semesterToInterval(payoutRequest.semester);
    const calculator = new SemesterCalculator(baseData, semester, documents.data)
    if (shouldDisplayStar(calculator.calculateOverallLevel(), payoutRequest)) {
      return true;
    }
  }
  return false;
}

const filterPayoutRequests = (payoutRequests: Map<string, INewPayoutRequestData[]> | null, fsid: string) => {
  const retval = new Map<string, INewPayoutRequestData>();
  if (payoutRequests) {
    const requestsForFs = payoutRequests.get(fsid) || [];
    for (let request of requestsForFs) {
      retval.set(request.semester, request);
    }
  }
  return retval;
}

const shouldShow = (baseData: IBaseFsData | undefined,
                    payoutRequests: Map<string, INewPayoutRequestData[]> | null) => {
  if (!baseData) {
    return false;
  }
  let show = true;
  if (settings.showOnlyWhoCurrentlyCanBePaid) {
    const calculator = new CurrentlyCanBePaidCalculator(baseData, null, documents.data);
    show = show && (AnnotationLevel.Error !== calculator.calculateOverallLevel());
  }
  if (settings.showOnlySemestersWithStar) {
    const filteredPayoutRequests = filterPayoutRequests(payoutRequests, baseData.fs_id);
    show = show && anySemesterHasStar(baseData, filteredPayoutRequests);
  }
  return show;
}

onBeforeMount(()=>{
  redirectToDiffIfNecessary();
  updatePageTitle();
});
watch(() => (fsData.data !== null), async () => {
  await nextTick();
  scrollToHashIfPresent();
});
</script>

<template>
  <div class="container section">
    <FixedDateBanner/>

    <div class="message is-info">
      <div class="message-body">
        <TopLegend/>
        <FilterSettings/>
      </div>
    </div>

    <template v-if="fsData.data">
      <ul>
        <template v-for="(singleFsData, key) in fsData.data" :key="key">
          <li v-if="singleFsData.base && shouldShow(singleFsData.base.data, payoutRequests.afsg)">
            <StudentBody :baseData="singleFsData.base.data"/>
          </li>
        </template>
      </ul>
    </template>
    <template v-else>
      <progress class="progress is-large is-info" max="100">60%</progress>
    </template>
  </div>
</template>
