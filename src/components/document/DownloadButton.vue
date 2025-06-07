<script setup lang="ts">
import type {IBaseFsData} from "@/interfaces";
import {useTokenStore} from "@/stores/token";
import {downloadFile} from "@/util";

defineProps<{
  filename: string,
  fs: string,
}>()

const token = useTokenStore();

const downloadUrl = (fs: string, filename: string) => {
  const url = import.meta.env.VITE_API_URL + "/file/get/" + fs + "/" + filename;
  downloadFile(url, token.token());
}
</script>

<template>
  <button class="button is-small" @click="()=>downloadUrl(fs, filename)">
    Öffnen
  </button>
</template>

<style scoped>
</style>