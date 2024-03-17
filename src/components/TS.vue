<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
  ts: string,
}>()
const datePart = computed(() => props.ts?.substring(0, 10));
const timePart = computed(() => props.ts?.substring(11, 16));
</script>

<template>
  <span :title="ts">{{ datePart }} {{ timePart }} UTC</span>
</template>

<style scoped>
</style>