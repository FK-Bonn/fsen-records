<script setup lang="ts">
import type {IBaseFsData, IDocumentData} from "@/interfaces";
import SingleDocument from "@/components/document/SingleDocument.vue";

defineProps<{
  document: IDocumentData,
  fsId: string,
}>()
</script>

<template>
  <SingleDocument :document="document" :fsId="fsId" :withReferences="false"/>
</template>

<style scoped>
</style>