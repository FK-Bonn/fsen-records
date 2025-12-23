<script setup lang="ts">
import type {IHHPItem, IHHPSide} from "@/interfaces";
import {euro} from "@/util";
import {computed} from "vue";

const props = defineProps<{
  data: IHHPSide,
  item: IHHPItem,
}>()

const euroOrNothing = (value: number | null) => {
  if (value === null) {
    return '–'
  }
  return euro(value / 100);
}

const titleNr = (numbers: number[]) => numbers.join('.');

const rowClass = (numbers: number[], extra = '') => numbers.length == 2 ? 'has-text-weight-bold ' + extra : numbers.length >= 4 ? 'is-italic ' + extra : extra;

const calcSum = (items: IHHPItem[], index: number) => {
  let sum = 0;
  for (let item of items) {
    sum += item.centValues[index] || 0;
  }
  return sum;
}

const annotations = computed(() => {
  const annotations = [
    {cls: '', annotation: ''},
    {cls: '', annotation: ''},
    {cls: '', annotation: ''},
  ];
  const subItems = props.data.items.filter(element => element.nr.length > props.item.nr.length && titleNr(element.nr.slice(0, props.item.nr.length)) === titleNr(props.item.nr));
  if (subItems.length) {
    for (const index of [0, 1, 2]) {
      const subItemSum = calcSum(subItems, index);
      if (subItemSum !== (props.item.centValues[index] || 0)) {
        annotations[index].cls = index === 0 ? 'is-danger' : 'has-background-warning-light';
        const difference = euroOrNothing(subItemSum - (props.item.centValues[index] || 0));
        annotations[index].annotation = 'Summe der Untertitel: ' + euroOrNothing(subItemSum) + ', Differenz: ' + difference;
      }
    }
  }
  return annotations;
})

</script>

<template>
  <td :class="rowClass(item.nr)">{{ titleNr(item.nr) }}</td>
  <td :class="rowClass(item.nr)">{{ item.text }}</td>
  <td :class="rowClass(item.nr, annotations[0].cls)" :title="annotations[0].annotation">
    {{ euroOrNothing(item.centValues[0]) }}
  </td>
  <td :class="rowClass(item.nr, annotations[1].cls)" :title="annotations[1].annotation">
    {{ euroOrNothing(item.centValues[1]) }}
  </td>
  <td :class="rowClass(item.nr, annotations[2].cls)" :title="annotations[2].annotation">
    {{ euroOrNothing(item.centValues[2]) }}
  </td>
</template>

<style scoped>
.table td:nth-child(n+3):nth-child(-n+5), .table th:nth-child(n+3):nth-child(-n+5),
.table td:nth-child(n+9):nth-child(-n+11), .table th:nth-child(n+9):nth-child(-n+11) {
  text-align: right;
}
</style>