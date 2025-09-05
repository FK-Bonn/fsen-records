<script setup lang="ts">

import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {computed} from "vue";
import {euroCents} from "../util";
import type {INewPayoutRequestData} from "@/interfaces";

const payoutRequests = usePayoutRequestStore()

interface CountWithSum {
  count: number
  sum: number
}

const mangleData = (data: Map<string, INewPayoutRequestData[]> | null): Map<string, Map<string, CountWithSum>> => {
  if (!data) {
    return new Map();
  }
  const retval: Map<string, Map<string, CountWithSum>> = new Map<string, Map<string, CountWithSum>>();
  for (let [, requests] of data) {
    for (let request of requests) {
      const semesterkey = request.semester;
      if (!retval.has(semesterkey)) {
        retval.set(semesterkey, new Map<string, CountWithSum>());
      }
      const oldValue = retval.get(semesterkey)?.get(request.status) || {count: 0, sum: 0}
      const newValue = {count: oldValue.count + 1, sum: oldValue.sum + request.amount_cents};
      retval.get(semesterkey)?.set(request.status, newValue);
    }
  }
  return retval;
}
const getHeaders = (data: Map<string, INewPayoutRequestData[]> | null): string[] => {
  if (!data) {
    return [];
  }
  const headers: string[] = ['GESTELLT', 'VOLLSTÄNDIG', 'VORGESTELLT', 'ANGENOMMEN', 'ANGEWIESEN', 'ABGELEHNT', 'FAILED'];
  for (let [, requests] of data) {
    for (let request of requests) {
      if (!headers.includes(request.status)) {
        headers.push(request.status);
      }
    }
  }
  return headers;
}
const semesters = computed(() => mangleData(payoutRequests.bfsg))
const headers = computed(() => getHeaders(payoutRequests.bfsg))

const totalSum = (status: string) => {
  let sum = 0;
  let count = 0;
  if (semesters.value) {
    for (let semester of semesters.value.values()) {
      sum += semester.get(status)?.sum || 0;
      count += semester.get(status)?.count || 0;
    }
  }
  return {sum, count};
}
const rowCountSum = (semester: string) => {
  let count = 0;
  if (semesters.value) {
    const semesterData = semesters.value.get(semester);
    for (let statusValues of semesterData?.values() || []) {
      count += statusValues.count;
    }
  }
  return count;
}
const totalPayoutRequestCount = () => {
  let count = 0;
  if (semesters.value) {
    for (let semester of semesters.value.values()) {
      for (let statusValues of semester.values()) {
        count += statusValues.count;
      }
    }
  }
  return count;
}
</script>

<template>
  <h2>Statusübersicht BFSG-Anträge</h2>

  <table class="table is-striped is-hoverable">
    <thead>
    <tr>
      <th>Semester</th>
      <th>#</th>
      <th colspan="2" v-for="header in headers" :key="header">{{ header }}</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="semester in [...semesters.keys()].sort().reverse()" :key="semester">
      <th>{{ semester }}</th>
      <td><span class="tag is-info is-light">{{rowCountSum(semester)}}</span></td>
      <template v-for="status in headers" :key="status">
        <td><span class="tag is-light">{{ semesters.get(semester)?.get(status)?.count || 0 }}</span></td>
        <td>{{ euroCents(semesters.get(semester)?.get(status)?.sum) }}</td>
      </template>
    </tr>
    </tbody>
    <tfoot>
    <tr>
      <th>Semester</th>
      <th>#</th>
      <th colspan="2" v-for="header in headers" :key="header">{{ header }}</th>
    </tr>
    <tr>
      <th>Gesamt</th>
      <td><span class="tag is-info is-light">{{ totalPayoutRequestCount() }}</span></td>
      <template v-for="header in headers" :key="header">
        <th><span class="tag is-light">{{ totalSum(header).count }}</span></th>
        <th>{{ euroCents(totalSum(header).sum) }}</th>
      </template>
    </tr>
    </tfoot>
  </table>
</template>
<style scoped>
.table td {
  text-align: right;
}
</style>
