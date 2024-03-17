<script setup lang="ts">
import type {Interval} from "@/Calculator";
import {formatDate} from "@/util";

defineProps<{
  interval: Interval,
}>()
</script>

<template>
  <template v-if="interval.start.toUTCString() === interval.end.toUTCString()">
    {{ formatDate(interval.start) }}
  </template>
  <template v-else>
    {{ formatDate(interval.start) }} – {{ formatDate(interval.end) }}
  </template>
</template>

<style scoped>
</style>