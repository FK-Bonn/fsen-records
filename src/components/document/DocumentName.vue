<script setup lang="ts">
import type {IDocumentData, IDocumentReference} from "@/interfaces";
import DateRange from "@/components/DateRange.vue";
import {Interval} from "@/Calculator";
import {computed} from "vue";
import {getDocumentPrefix} from "@/util";

const props = defineProps<{
  document: IDocumentData,
}>()


const hasDateInParentheses = (document: IDocumentData|IDocumentReference) => {
  return ['HHP', 'HHR'].includes(document.base_name) || document.base_name.startsWith('NHHP');
}

const prefix = computed(() => getDocumentPrefix(props.document));
const dateInParentheses = computed(() => hasDateInParentheses(props.document));
</script>

<template>
  <template v-if="dateInParentheses">
    {{ prefix }}
    (
    <DateRange :interval="Interval.fromStrings(document.date_start, document.date_end || document.date_start)"/>
    )
  </template>
  <template v-else>
    {{ prefix }}
    <DateRange :interval="Interval.fromStrings(document.date_start, document.date_end || document.date_start)"/>
  </template>
</template>

<style scoped>
ul, ul:not(:last-child) {
  list-style: none !important;
  margin-top: .2em !important;
  margin-bottom: .1em;
}
</style>