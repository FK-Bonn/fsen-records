<script setup lang="ts">
import type {INewPayoutRequestData} from "@/interfaces";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {computed, onBeforeMount} from "vue";
import {euroCents, updatePageTitle} from "../util";
import {useFixedDateStore} from "@/stores/fixedDate";
import FixedDateBanner from "@/components/FixedDateBanner.vue";

interface SemesterSums {
  open: number
  completed: number
}

const fixedDate = useFixedDateStore();

const mangleData = (data: Map<string, INewPayoutRequestData[]> | null): Map<string, SemesterSums> => {
  if (!data) {
    return new Map();
  }
  const retval: Map<string, SemesterSums> = new Map<string, SemesterSums>();
  for (let [fs, requests] of data) {
    for (let request of requests) {
      if (!retval.has(request.semester)) {
        retval.set(request.semester, {open: 0, completed: 0});
      }
      const oldValue = retval.get(request.semester) || {open: 0, completed: 0};
      let newValue = oldValue;
      if (['GESTELLT', 'VOLLSTÄNDIG'].includes(request.status)) {
        newValue = {open: oldValue.open + request.amount_cents, completed: oldValue.completed};
      }
      if (['ANGEWIESEN', 'ÜBERWIESEN', 'FAILED'].includes(request.status)) {
        newValue = {open: oldValue.open, completed: oldValue.completed + request.amount_cents};
      }
      retval.set(request.semester, newValue);
    }
  }
  return retval;
}

const getSumForStatus = (data: Map<string, INewPayoutRequestData[]> | null, status: string): number => {
  if (!data) {
    return 0;
  }
  let retval = 0;
  for (let [fs, requests] of data) {
    for (let request of requests) {
      if (request.status === status) {
        retval += request.amount_cents;
      }
    }
  }
  return retval;
}

const getNextFinancialYear = () => {
  const today = fixedDate.date ? new Date(fixedDate.date) : new Date();
  if (today.getMonth() > 5) {
    return `${today.getFullYear() + 1}/${(today.getFullYear() + 2).toString().substring(2)}`;
  }
  return `${(today.getFullYear())}/${(today.getFullYear() + 1).toString().substring(2)}`;
}

const getRequestableSemestersForNextFinancialYear: () => string[] = () => {
  const today = fixedDate.date ? new Date(fixedDate.date) : new Date();
  const semesters = [];
  semesters.push(`${today.getFullYear()}-SoSe`);
  semesters.push(`${today.getFullYear()}-WiSe`);
  if (today.getMonth() > 5) {
    semesters.push(`${today.getFullYear() + 1}-SoSe`);
    semesters.push(`${today.getFullYear() + 1}-WiSe`);
  } else {
    semesters.push(`${today.getFullYear() - 1}-SoSe`);
    semesters.push(`${today.getFullYear() - 1}-WiSe`);
  }
  semesters.sort().reverse();
  return semesters;
}

const getTransitionalSemestersForNextFinancialYear: () => string[] = () => {
  const today = fixedDate.date ? new Date(fixedDate.date) : new Date();
  const semesters = [];
  if (today.getMonth() > 5) {
    semesters.push(`${today.getFullYear() - 1}-SoSe`);
    semesters.push(`${today.getFullYear() - 1}-WiSe`);
  } else {
    semesters.push(`${today.getFullYear() - 2}-SoSe`);
    semesters.push(`${today.getFullYear() - 2}-WiSe`);
  }
  semesters.sort().reverse();
  return semesters;
}

const payoutRequests = usePayoutRequestStore();

const semesters = computed(() => mangleData(payoutRequests.afsg));
const nextFinancialYear = computed(() => getNextFinancialYear());
const requestableSemesters = computed(() => getRequestableSemestersForNextFinancialYear());
const transitionalSemesters = computed(() => getTransitionalSemestersForNextFinancialYear());
const remainingSemesters = computed(() => [...semesters.value.keys()].filter(key => !requestableSemesters.value.includes(key)).sort().reverse());
const requestableSum = computed(() => requestableSemesters.value.reduce((intermediateSum, semester) => intermediateSum + ((60_000 * 100) - (semesters.value.get(semester) || {
  open: 0,
  completed: 0
}).completed), 0));
const completableSum = computed(() => remainingSemesters.value.reduce((intermediateSum, semester) => intermediateSum + (semesters.value.get(semester)?.open || 0), 0));
const acceptedBfsg = computed(() => getSumForStatus(payoutRequests.bfsg, 'ANGENOMMEN'));

onBeforeMount(()=>{
  updatePageTitle('Haushaltsplansentwurf');
});
</script>

<template>
  <div class="container section">
    <FixedDateBanner/>

    <h1 class="title is-1">💸 Haushaltsplansentwurf</h1>
    <h3 class="title is-3">HHP für nächstes Haushaltsjahr ({{ nextFinancialYear }})</h3>

    <div class="columns">
      <div class="column">
        <table class="table is-striped is-hoverable">
          <thead>
          <tr>
            <th colspan="3">Einnahmen</th>
          </tr>
          <tr>
            <th>Titel</th>
            <th>Betrag</th>
            <th>Erläuterung</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>Beiträge</td>
            <td>???</td>
            <td>Studierendenzahl WiSe * Beitrag für FSen WiSe + Studierendenzahl SoSe * Beitrag für FSen SoSe</td>
          </tr>
          <tr>
            <td>Entnahme Rücklage</td>
            <td>???</td>
            <td>Das, was zuvor in die Rücklage überführt worden war</td>
          </tr>
          <tr>
            <th>Überschuss vorheriges HHJ</th>
            <th>???</th>
            <th>Summe der Unterpunkte</th>
          </tr>
          <tr>
            <td>AFSG</td>
            <td>{{ euroCents(requestableSum + completableSum) }}</td>
            <td>Bereits zugesprochene oder noch beantragbare AFSG</td>
          </tr>
          <tr>
            <td>BFSG</td>
            <td>{{ euroCents(acceptedBfsg) }}</td>
            <td>Bereits zugesprochene, aber noch nicht überwiesene BFSG</td>
          </tr>
          <tr>
            <td>Sonstige</td>
            <td>???</td>
            <td>Restliches Geld aus AFSG, BFSG, AE, …</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="column">
        <table class="table is-striped is-hoverable">
          <thead>
          <tr>
            <th colspan="3">Ausgaben</th>
          </tr>
          <tr>
            <th>Titel</th>
            <th>Betrag</th>
            <th>Erläuterung</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <th>AFSG (beantragbar)</th>
            <th>{{ euroCents(requestableSum) }}</th>
            <th>Summe der Unterpunkte</th>
          </tr>
          <tr v-for="semester in requestableSemesters.slice(0,2)" :key="semester">
            <td>{{ semester }}</td>
            <td>{{ euroCents((60_000 * 100)) }}</td>
            <td>60k neu</td>
          </tr>
          <tr v-for="semester in requestableSemesters.slice(2,5)" :key="semester">
            <td>{{ semester }}</td>
            <td>{{
                euroCents((60_000 * 100) - (semesters.get(semester) || {
                  open: 0,
                  completed: 0
                }).completed)
              }}
            </td>
            <td>60k abzüglich ANGEWIESEN|UEBERWIESEN|FAILED</td>
          </tr>
          <tr v-for="semester in transitionalSemesters" :key="semester">
            <td>{{ semester }}</td>
            <td>{{ euroCents(0) }}</td>
            <td>Beantragter Betrag rutscht nach AFSG (vervollständigbar)</td>
          </tr>
          <tr>
            <th>AFSG (vervollständigbar)</th>
            <th>{{ euroCents(completableSum) }}</th>
            <th>Summe der Unterpunkte</th>
          </tr>
          <tr v-for="semester in remainingSemesters" :key="semester">
            <td>{{ semester }}</td>
            <td>{{ euroCents(semesters.get(semester)?.open) }}</td>
            <td>Betrag für dieses Semester im Zustand EINGEREICHT|GESTELLT|VOLLSTÄNDIG</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table thead th {
  text-align: center;
}

.table td:nth-child(2), .table th:nth-child(2) {
  text-align: right;
}
</style>