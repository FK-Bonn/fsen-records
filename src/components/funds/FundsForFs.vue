<script setup lang="ts">
import type {Fraction, IFundsDistribution} from "@/interfaces";
import {computed} from "vue";
import {euro} from "../../util";
import IconCross from "@/components/icons/IconCross.vue";

const props = defineProps<{
  fs: string | number,
  totalValue: number,
  baseValue: number,
  fraction: Fraction,
  sumOfAllFractions: number,
  fsCount: number
}>()
const flexibleValue = computed(() => {
  const factor = (props.fraction.numerator / props.fraction.denominator) / props.sumOfAllFractions;
  const remainder = props.totalValue - (props.fsCount * props.baseValue);
  return remainder * factor;
})
</script>

<template>
  <td> <IconCross v-if="fs == 'unknown'" /> {{ fs }} <IconCross v-if="fs == 'unknown'" /></td>
  <td>{{ fraction.numerator }}&frasl;{{ fraction.denominator }}</td>
  <td>{{ euro(baseValue) }}</td>
  <td>{{ euro(flexibleValue) }}</td>
  <td>{{ euro(baseValue + flexibleValue) }}</td>
</template>

<style scoped>
.table td:nth-child(3),
.table td:nth-child(4),
.table td:nth-child(5) {
  text-align: right;
}
</style>