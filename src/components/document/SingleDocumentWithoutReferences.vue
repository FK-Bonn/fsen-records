<script setup lang="ts">
import type {IBaseFsData, IDocumentData} from "@/interfaces";
import SingleDocument from "@/components/document/SingleDocument.vue";

defineProps<{
  document: IDocumentData,
  baseData: IBaseFsData,
}>()
</script>

<template>
  <SingleDocument :document="document" :baseData="baseData" :withReferences="false"/>
</template>

<style scoped>
</style>