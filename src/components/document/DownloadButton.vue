<script setup lang="ts">
import type {IStudentBody} from "@/interfaces";
import {useTokenStore} from "@/stores/token";
import {downloadFile} from "@/util";

defineProps<{
  filename: string,
  studentBody: IStudentBody,
}>()

const token = useTokenStore();

const downloadUrl = (fs: string, filename: string) => {
  const url = import.meta.env.VITE_API_URL + "/file/" + fs + "/" + filename;
  downloadFile(url, token.apiToken);
}
</script>

<template>
  <button class="button is-small" @click="()=>downloadUrl(studentBody.id, filename)">
    Öffnen
  </button>
</template>

<style scoped>
</style>