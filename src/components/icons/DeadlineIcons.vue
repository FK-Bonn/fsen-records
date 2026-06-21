<script setup lang="ts">
import type {Interval} from "@/Calculator";
import {
  deNow,
  formatDate,
  formatDateTime,
  getLastDayForSubmission,
  isBeforeOrOnLastDayForSubmission,
  stringToDate
} from "@/util";
import {computed} from "vue";
import IconCalendar from "@/components/icons/IconCalendar.vue";
import {useFixedDateStore} from "@/stores/fixedDate";
import {DateTime} from "luxon";

const props = defineProps<{
  interval: Interval,
}>()

const fixedDate = useFixedDateStore();

const completionDeadlineOverrides: { [key: string]: string } = {
  "2018-09-30": "2022-03-31",
  "2019-03-31": "2022-03-31",
  "2019-09-30": "2022-03-31",
  "2020-03-31": "2022-05-31",
  "2027-06-30": "2028-06-30",
}

const payoutDeadlineOverrides: { [key: string]: string } = {
  "2017-03-31": "2026-09-30",
  "2017-09-30": "2026-09-30",
  "2018-03-31": "2026-09-30",
  "2018-09-30": "2026-09-30",
  "2019-03-31": "2026-09-30",
  "2019-09-30": "2026-09-30",
  "2020-03-31": "2026-09-30",
  "2020-09-30": "2026-09-30",
  "2021-03-31": "2026-09-30",
  "2021-09-30": "2026-09-30",
  "2022-03-31": "2026-09-30",
  "2022-09-30": "2026-09-30",
  "2027-06-30": "2028-12-31",
}

const isFutureSemester = (interval: Interval, fixedDate: string | null): boolean => {
  const today = fixedDate ? new Date(fixedDate) : new Date();
  return today < interval.start;
}


const getLastDayForCompletion = (interval: Interval): DateTime => {
  for (let key in completionDeadlineOverrides) {
    if (interval.end.getTime() === stringToDate(key).getTime()) {
      return DateTime.fromISO(completionDeadlineOverrides[key]);
    }
  }
  if (interval.start.getMonth() === 6) {
    return DateTime.fromISO(interval.end.toISOString(), {zone: 'utc'})
        .setZone('Europe/Berlin')
  }
  return DateTime.fromISO(interval.end.toISOString(), {zone: 'utc'})
      .setZone('Europe/Berlin')
      .plus({years: 2});
}

const getLastDayForPayout = (interval: Interval): DateTime => {
  for (let key in payoutDeadlineOverrides) {
    if (interval.end.getTime() === stringToDate(key).getTime()) {
      return DateTime.fromISO(payoutDeadlineOverrides[key]);
    }
  }
  if (interval.start.getMonth() === 6) {
    return DateTime.fromISO(interval.end.toISOString(), {zone: 'utc'})
        .setZone('Europe/Berlin')
      .plus({days: 1})
      .plus({months: 6})
      .minus({days: 1});
  }
  return DateTime.fromISO(interval.end.toISOString(), {zone: 'utc'})
      .setZone('Europe/Berlin')
      .plus({days: 1})
      .plus({months: 7 * 6})
      .minus({days: 1});
}

const isLastDayForCompletionOrEarlier = (interval: Interval, fixedDate: string | null): boolean => {
  const today = fixedDate ? fixedDate : deNow().toFormat('yyyy-MM-dd');
  return today <= getLastDayForCompletion(interval).toFormat('yyyy-MM-dd');
}
const isLastDayForPayoutOrEarlier = (interval: Interval, fixedDate: string | null): boolean => {
  const today = fixedDate ? fixedDate : deNow().toFormat('yyyy-MM-dd');
  return today <= getLastDayForPayout(interval).toFormat('yyyy-MM-dd');
}

const getSubmissionDeadline = (interval: Interval): string => {
  return 'Antragsfrist: ' + formatDateTime(getLastDayForSubmission(interval));
}

const getCompletionDeadline = (interval: Interval): string => {
  return 'Frist zur Vervollständigung: ' + formatDateTime(getLastDayForCompletion(interval));
}

const getPayoutDeadline = (interval: Interval): string => {
  return 'Frist zur Auszahlung: ' + formatDateTime(getLastDayForPayout(interval));
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
  if (isLastDayForCompletionOrEarlier(interval, fixedDate)) {
    return 'has-text-warning';
  }
  return 'has-text-secondary';
}

const getColourClassForPayout = (interval: Interval, fixedDate: string | null): string => {
  if (isFutureSemester(interval, fixedDate)) {
    return 'has-text-danger';
  }
  if (isLastDayForPayoutOrEarlier(interval, fixedDate)) {
    return 'has-text-success';
  }
  return 'has-text-secondary';
}

const shouldDisplay = (interval: Interval): boolean => {
  return !!interval;

}

const display = computed(() => shouldDisplay(props.interval));
const submissionDeadline = computed(() => getSubmissionDeadline(props.interval));
const completionDeadline = computed(() => getCompletionDeadline(props.interval));
const payoutDeadline = computed(() => getPayoutDeadline(props.interval));
const submissionClass = computed(() => getColourClassForSubmission(props.interval, fixedDate.date));
const completionClass = computed(() => getColourClassForCompletion(props.interval, fixedDate.date));
const payoutClass = computed(() => getColourClassForPayout(props.interval, fixedDate.date));

</script>

<template>
  <template v-if="display">
    <span :class="submissionClass">
        <IconCalendar :title="submissionDeadline"/>
    </span>
    <span :class="completionClass">
        <IconCalendar :title="completionDeadline"/>
    </span>
    <span :class="payoutClass">
        <IconCalendar :title="payoutDeadline"/>
    </span>
  </template>
</template>

<style scoped>
</style>