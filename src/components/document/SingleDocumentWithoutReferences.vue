<script setup lang="ts">
import type {IDocumentData, IStudentBody} from "@/interfaces";
import SingleDocument from "@/components/document/SingleDocument.vue";

defineProps<{
  document: IDocumentData,
  studentBody: IStudentBody,
}>()
</script>

<template>
  <SingleDocument :document="document" :studentBody="studentBody" :withReferences="false"/>
</template>

<style scoped>
</style>