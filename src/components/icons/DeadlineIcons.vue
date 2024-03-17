<script setup lang="ts">
import type {Interval} from "@/Calculator";
import {formatDate, getLastDayForSubmission, isBeforeOrOnLastDayForSubmission, stringToDate} from "@/util";
import {computed} from "vue";
import IconCalendar from "@/components/icons/IconCalendar.vue";
import {useFixedDateStore} from "@/stores/fixedDate";

const props = defineProps<{
  interval: Interval,
}>()

const fixedDate = useFixedDateStore();

const completionDeadlineOverrides: { [key: string]: string } = {
  "2018-09-30": "2022-03-31",
  "2019-03-31": "2022-03-31",
  "2019-09-30": "2022-03-31",
  "2020-03-31": "2022-05-31",
}

const isFutureSemester = (interval: Interval, fixedDate: string | null): boolean => {
  const today = fixedDate ? new Date(fixedDate) : new Date();
  return today < interval.start;
}


const getLastDayForCompletion = (interval: Interval): Date => {
  for (let key in completionDeadlineOverrides) {
    if (interval.end.getTime() === stringToDate(key).getTime()) {
      return stringToDate(completionDeadlineOverrides[key]);
    }
  }
  const lastDayForCompletion = new Date(interval.end);
  lastDayForCompletion.setFullYear(lastDayForCompletion.getFullYear() + 2);
  return lastDayForCompletion;
}

const isBeforeLastDayForCompletion = (interval: Interval, fixedDate: string | null): boolean => {
  const today = fixedDate ? new Date(fixedDate) : new Date();
  return today < getLastDayForCompletion(interval);
}

const getSubmissionDeadline = (interval: Interval): string => {
  return 'Antragsfrist: ' + formatDate(getLastDayForSubmission(interval));
}

const getCompletionDeadline = (interval: Interval): string => {
  return 'Frist zur Vervollständigung: ' + formatDate(getLastDayForCompletion(interval));
}

const getColourClassForSubmission = (interval: Interval, fixedDate: string | null): string => {
  if (isFutureSemester(interval, fixedDate)) {
    return 'has-text-danger';
  }
  if (isBeforeOrOnLastDayForSubmission(interval, fixedDate)) {
    return 'has-text-info';
  }
  return 'has-text-secondary';
}

const getColourClassForCompletion = (interval: Interval, fixedDate: string | null): string => {
  if (isFutureSemester(interval, fixedDate)) {
    return 'has-text-danger';
  }
  if (isBeforeLastDayForCompletion(interval, fixedDate)) {
    return 'has-text-warning';
  }
  return 'has-text-secondary';
}

const shouldDisplay = (interval: Interval): boolean => {
  return !!interval;

}

const display = computed(() => shouldDisplay(props.interval));
const submissionDeadline = computed(() => getSubmissionDeadline(props.interval));
const completionDeadline = computed(() => getCompletionDeadline(props.interval));
const submissionClass = computed(() => getColourClassForSubmission(props.interval, fixedDate.date));
const completionClass = computed(() => getColourClassForCompletion(props.interval, fixedDate.date));

</script>

<template>
  <template v-if="display">
    <span :class="submissionClass">
        <IconCalendar :title="submissionDeadline"/>
    </span>
    <span :class="completionClass">
        <IconCalendar :title="completionDeadline"/>
    </span>
  </template>
</template>

<style scoped>
</style>