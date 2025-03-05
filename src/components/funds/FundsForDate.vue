<script setup lang="ts">
import type {IFundsDistribution} from "@/interfaces";
import FundsForFs from "@/components/funds/FundsForFs.vue";
import {computed} from "vue";

const props = defineProps<{
  values: IFundsDistribution,
  totalValue: number,
  baseValue: number,
}>()
const sumOfAllFractions = computed(() => {
  let sum = 0;
  for (let fs in props.values) {
    const value = props.values[fs];
    sum += (value.numerator / value.denominator);
  }
  return sum;
})
const fsCount = computed(() => Object.keys(props.values).length)
</script>

<template>
  <table class="table is-small is-striped">
    <thead>
    <tr>
      <th>Fachschaft</th>
      <th>Anteile</th>
      <th>Sockelbetrag</th>
      <th>Flexibler Betrag</th>
      <th>Gesamtbetrag</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(fraction, fs) in values" :key="fs">
      <FundsForFs
          :fs="fs"
          :totalValue="totalValue"
          :baseValue="baseValue"
          :fraction="fraction"
          :fsCount="fsCount"
          :sumOfAllFractions="sumOfAllFractions"
      />
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
</style>