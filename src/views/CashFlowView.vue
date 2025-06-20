<script setup lang="ts">
import {computed, onBeforeMount} from "vue";
import {toFinancialYear, updatePageTitle} from "@/util";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import CashFlowSemesterRow from "@/components/cashflow/CashFlowSemesterRow.vue";
import CashFlowFinancialYearRow from "@/components/cashflow/CashFlowFinancialYearRow.vue";

const payoutRequests = usePayoutRequestStore();

const semesters = computed(() => {
  const values = new Set<string>();
  for (let requestmap of [payoutRequests.afsg, payoutRequests.bfsg]) {
    for (let [, requests] of requestmap || []) {
      for (let request of requests) {
        const semesterkey = request.semester;
        values.add(semesterkey);
      }
    }
  }
  return [...values].sort().reverse();
})
const financialYears = computed(() => {
  const values = new Set<string>();
  for (let requestmap of [payoutRequests.afsg, payoutRequests.bfsg]) {
    for (let [, requests] of requestmap || []) {
      for (let request of requests) {
        const financialYear = toFinancialYear(request.status_date);
        values.add(financialYear);
      }
    }
  }
  return [...values].sort().reverse();
})
</script>

<template>
  <h2>AFSG und BFSG pro Semester</h2>

  <p>Summen sind gruppiert nach dem Semester, auf das der jeweilige Antrag sich bezieht.</p>

  <table class="table">
    <thead>
    <tr>
      <th>Semester</th>
      <th>AFSG beantragt</th>
      <th>AFSG benötigt</th>
      <th>BFSG beantragt</th>
      <th>BFSG benötigt</th>
      <th>Gesamt beantragt</th>
      <th>Gesamt benötigt</th>
    </tr>
    </thead>
    <tbody>
    <template v-for="semester in semesters" :key="semester">
      <CashFlowSemesterRow :semester="semester"/>
    </template>
    </tbody>
  </table>


  <h2>Gebuchte AFSG und BFSG pro Haushaltsjahr</h2>

  <p>Summen sind gruppiert nach dem Haushaltsjahr, in dem der jeweilige Antrag angewiesen/überwiesen wurde.</p>

  <table class="table">
    <thead>
    <tr>
      <th>Haushaltsjahr</th>
      <th>AFSG</th>
      <th>BFSG</th>
      <th>Gesamt</th>
    </tr>
    </thead>
    <tbody>
    <template v-for="financialYear in financialYears" :key="financialYear">
      <CashFlowFinancialYearRow :financialYear="financialYear"/>
    </template>
    </tbody>
  </table>
</template>

<style scoped>
summary {
  cursor: pointer;
}
</style>