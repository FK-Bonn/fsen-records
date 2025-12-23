<script setup lang="ts">
import type {IHHP, IHHPSide} from "@/interfaces";
import {euroCents} from "@/util";
import HHPItem from "@/components/hhp/HHPItem.vue";
import {computed} from "vue";

const props = defineProps<{
  data: IHHP,
}>()

const calcSum = (data: IHHPSide, index: number) => {
  let sum = 0;
  const topLevelItems = data.items.filter(item => item.nr.length === 2);
  for (const item of topLevelItems) {
    sum += item.centValues[index] || 0;
  }
  return sum;
}

const compareNr = (a: number[], b: number[]) => {
  const len = Math.min(a.length, b.length);
  for (let i = 1; i < len; i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i];
    }
  }
  return a.length - b.length;
}

const rows = computed(() => {
  const value = [];
  let earningsIndex = 0;
  let expensesIndex = 0;
  while (earningsIndex < props.data.earnings.items.length && expensesIndex < props.data.expenses.items.length) {
    const result = compareNr(props.data.earnings.items[earningsIndex].nr, props.data.expenses.items[expensesIndex].nr);
    if (result === 0) {
      if (props.data.earnings.items[earningsIndex].nr.length === 2 || props.data.expenses.items[expensesIndex].nr.length === 2) {
        value.push([null, null]);
      }
      value.push([props.data.earnings.items[earningsIndex], props.data.expenses.items[expensesIndex]]);
      earningsIndex++;
      expensesIndex++;
    } else if (result > 0) {
      if (props.data.expenses.items[expensesIndex].nr.length === 2) {
        value.push([null, null]);
      }
      value.push([null, props.data.expenses.items[expensesIndex]]);
      expensesIndex++;
    } else {
      if (props.data.earnings.items[earningsIndex].nr.length === 2) {
        value.push([null, null]);
      }
      value.push([props.data.earnings.items[earningsIndex], null]);
      earningsIndex++;
    }
  }
  while (earningsIndex < props.data.earnings.items.length) {
    value.push([props.data.earnings.items[earningsIndex], null]);
    earningsIndex++;
  }
  while (expensesIndex < props.data.expenses.items.length) {
    value.push([null, props.data.expenses.items[expensesIndex]]);
    expensesIndex++;
  }
  return value;
})

const earningSums = computed(() => [
  calcSum(props.data.earnings, 0),
  calcSum(props.data.earnings, 1),
  calcSum(props.data.earnings, 2),
])

const expenseSums = computed(() => [
  calcSum(props.data.expenses, 0),
  calcSum(props.data.expenses, 1),
  calcSum(props.data.expenses, 2),
])

const sumAnnotations = computed(() => {
  const annotations = [
    {cls: '', annotation: ''},
    {cls: '', annotation: ''},
    {cls: '', annotation: ''},
  ];
  for (let index of [0, 1]) {
    if (expenseSums.value[index] !== earningSums.value[index]) {
      annotations[index].cls = index === 0 ? 'is-danger' : 'has-background-warning-light';
      annotations[index].annotation = 'Die Summe der Einnahmen muss gleich der Summe der Ausgaben sein, es besteht jedoch eine Differenz von ' + euroCents(earningSums.value[index] - expenseSums.value[index]);
    }
  }
  return annotations;
})
const titleAnnotations = computed(() => {
  const annotations = [
    {cls: '', annotation: ''},
    {cls: '', annotation: ''},
    {cls: '', annotation: ''},
  ];
  for (let index of [0, 1, 2]) {
    if (props.data.earnings.columnTitles[index] !== props.data.expenses.columnTitles[index]) {
      annotations[index].cls = 'is-danger';
      annotations[index].annotation = 'Es müssen schon dieselben Spaltentitel bei Einnahmen und Ausgaben sein';
    }
  }
  return annotations;
})

</script>

<template>

  <h2 class="title has-text-centered">{{ data.title }}</h2>
  <h3 class="subtitle has-text-centered">für das Haushaltsjahr {{ data.financialYearTitle }}
    vom {{ data.financialYearStart }} bis zum {{ data.financialYearEnd }}
    ({{ data.financialYearStatutesLocation }})<br>
    beschlossen von der {{ data.passedCommittee }} am {{ data.passedDate }}
  </h3>
  <table class="table is-striped is-small is-bordered">
    <thead>
    <tr>
      <th colspan="5" class="has-text-centered">Einnahmen</th>
      <th></th>
      <th colspan="5" class="has-text-centered">Ausgaben</th>
    </tr>
    <tr>
      <th></th>
      <th></th>
      <th :class="titleAnnotations[0].cls" :title="titleAnnotations[0].annotation">{{
          data.earnings.columnTitles[0]
        }}
      </th>
      <th :class="titleAnnotations[1].cls" :title="titleAnnotations[1].annotation">{{
          data.earnings.columnTitles[1]
        }}
      </th>
      <th :class="titleAnnotations[2].cls" :title="titleAnnotations[2].annotation">{{
          data.earnings.columnTitles[2]
        }}
      </th>
      <th></th>
      <th></th>
      <th></th>
      <th :class="titleAnnotations[0].cls" :title="titleAnnotations[0].annotation">{{
          data.expenses.columnTitles[0]
        }}
      </th>
      <th :class="titleAnnotations[1].cls" :title="titleAnnotations[1].annotation">{{
          data.expenses.columnTitles[1]
        }}
      </th>
      <th :class="titleAnnotations[2].cls" :title="titleAnnotations[2].annotation">{{
          data.expenses.columnTitles[2]
        }}
      </th>
    </tr>
    <tr>
      <th></th>
      <th>Summe</th>
      <th :class="sumAnnotations[0].cls" :title="sumAnnotations[0].annotation">{{ euroCents(earningSums[0]) }}</th>
      <th :class="sumAnnotations[1].cls" :title="sumAnnotations[1].annotation">{{ euroCents(earningSums[1]) }}</th>
      <th :class="sumAnnotations[2].cls" :title="sumAnnotations[2].annotation">{{ euroCents(earningSums[2]) }}</th>
      <th></th>
      <th></th>
      <th>Summe</th>
      <th :class="sumAnnotations[0].cls" :title="sumAnnotations[0].annotation">{{ euroCents(expenseSums[0]) }}</th>
      <th :class="sumAnnotations[1].cls" :title="sumAnnotations[1].annotation">{{ euroCents(expenseSums[1]) }}</th>
      <th :class="sumAnnotations[2].cls" :title="sumAnnotations[2].annotation">{{ euroCents(expenseSums[2]) }}</th>
    </tr>
    </thead>
    <tbody>
    <template v-for="row in rows">
      <tr>
        <template v-if="row[0]">
          <HHPItem :data="data.earnings" :item="row[0]"/>
        </template>
        <template v-else>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </template>
        <td></td>
        <template v-if="row[1]">
          <HHPItem :data="data.expenses" :item="row[1]"/>
        </template>
        <template v-else>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </template>
      </tr>
    </template>
    </tbody>
  </table>

  <template v-if="data.annotations">
    <strong>Haushaltsvermerke</strong>
    <ul>
      <li v-for="annotation in data.annotations">{{ annotation }}</li>
    </ul>
  </template>
</template>

<style scoped>
.table td:nth-child(n+3):nth-child(-n+5), .table th:nth-child(n+3):nth-child(-n+5),
.table td:nth-child(n+9):nth-child(-n+11), .table th:nth-child(n+9):nth-child(-n+11) {
  text-align: right;
}
</style>