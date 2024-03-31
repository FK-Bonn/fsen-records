<script setup lang="ts">
import TopLegend from "@/components/TopLegend.vue";
import {useStudentBodiesStore} from "@/stores/studentBodies";
import {useScieboDataStore} from "@/stores/scieboData";
import StudentBody from "@/components/studentbody/StudentBody.vue";
import {computed, nextTick, onBeforeMount, onMounted, watch} from "vue";
import {AnnotationLevel, type INewPayoutRequestData, type IStudentBody} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import FilterSettings from "@/components/FilterSettings.vue";
import {CurrentlyCanBePaidCalculator, Interval, SemesterCalculator} from "@/Calculator";
import {calculateSemesterId, scrollToHashIfPresent, shouldDisplayStar} from "@/util";
import {usePageSettingsStore} from "@/stores/pageSettings";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import FixedDateBanner from "@/components/FixedDateBanner.vue";
import {useRouter} from "vue-router";
import {useAllFsData} from "@/stores/allFsData";

const sciebo = useScieboDataStore();
const fsData = useAllFsData();
const payoutRequests = usePayoutRequestStore();
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

const anySemesterHasStar = (studentBody: IStudentBody, payoutRequests: Map<string, INewPayoutRequestData> | null,
                            semesters: (Interval | undefined)[] | undefined) => {
  if (!studentBody || !payoutRequests || !semesters) {
    return false;
  }
  for (let semester of semesters) {
    const semesterId = calculateSemesterId(semester);
    if (semester && semesterId) {
      const payoutRequest = payoutRequests.get(semesterId);
      if (payoutRequest) {
        const calculator = new SemesterCalculator(studentBody, semester)
        if (shouldDisplayStar(calculator.calculateOverallLevel(), payoutRequest)) {
          return true;
        }
      }
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

const shouldShow = (studentBody: IStudentBody,
                    payoutRequests: Map<string, INewPayoutRequestData[]> | null,
                    semesters: (Interval | undefined)[] | undefined) => {
  let show = true;
  if (settings.showOnlyWhoCurrentlyCanBePaid) {
    const calculator = new CurrentlyCanBePaidCalculator(studentBody, null);
    show = show && (AnnotationLevel.Error !== calculator.calculateOverallLevel());
  }
  if (settings.showOnlySemestersWithStar) {
    const filteredPayoutRequests = filterPayoutRequests(payoutRequests, studentBody.id);
    show = show && anySemesterHasStar(studentBody, filteredPayoutRequests, semesters);
  }
  return show;
}

const lastUpdate = computed(() => sciebo.data && new Date(sciebo.data.timestamp * 1000).toLocaleString());
const lastUpdateLevel = computed(() => {
  if (!sciebo.data) {
    return AnnotationLevel.Unchecked;
  }
  return (Date.now() / 1000 - sciebo.data.timestamp) > 3600 ? AnnotationLevel.Warning : AnnotationLevel.Ok;
});
const semesters = computed(() => sciebo.data?.semesters.map(value => Interval.fromStrings(value.start, value.end)))

onBeforeMount(()=>redirectToDiffIfNecessary());
watch(() => (sciebo.data !== null && fsData.data !== null), async () => {
  await nextTick();
  scrollToHashIfPresent();
});
</script>

<template>
  <div class="container section">
    <FixedDateBanner/>

    <div class="message is-info">
      <div class="message-body">
        <p class="is-pulled-right">Letzte Aktualisierung:
          <IconForLevel :level="lastUpdateLevel"/>
          {{ lastUpdate }}
        </p>

        <TopLegend/>
        <FilterSettings/>
      </div>
    </div>

    <ul>
      <template v-for="[key, studentBody] in sciebo.data?.studentBodies" :key="key">
        <li v-if="shouldShow(studentBody, payoutRequests.afsg, semesters)">
          <StudentBody :studentBody="studentBody"/>
      </li>
      </template>
    </ul>
  </div>
</template>
