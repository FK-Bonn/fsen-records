<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {downloadFile} from "@/util";

const props = defineProps<{
  date: string | number,
  filename: string,
}>()

const emit = defineEmits<{
  reloadLog: []
}>()

const token = useTokenStore();

const downloadUrl = () => {
  const url = import.meta.env.VITE_API_URL + "/electoral-registers/" + props.date + "/" + props.filename;
  downloadFile(url, token.token())?.then(()=>emit('reloadLog'));
}
</script>

<template>
  <button class="button is-small" @click="()=>downloadUrl()">
    Herunterladen
  </button>
</template>

<style scoped>
</style>