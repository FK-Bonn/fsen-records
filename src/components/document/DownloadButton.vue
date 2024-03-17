<script setup lang="ts">
import type {IAnnotatedDocument, IStudentBody} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import IconQuestionmark from "@/components/icons/IconQuestionmark.vue";
import DateRange from "@/components/DateRange.vue";
import {Interval, VerdictCalculator} from "@/Calculator";
import {computed} from "vue";
import {useTokenStore} from "@/stores/token";

defineProps<{
  filename: string,
  studentBody: IStudentBody,
}>()

const token = useTokenStore();

const downloadUrl = (fs: string, filename: string) => {
  const url = import.meta.env.VITE_API_URL + "/file/" + fs + "/" + filename;
  fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token.apiToken}`}})
      .then(resp => {
        if (resp.ok) {
          return resp.blob();
        } else {
          return Promise.reject('An error occured');
        }
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      })
      .catch(() => alert('Hoppla! Das hat leider nicht geklappt'));
}
</script>

<template>
  <button class="button is-small" @click="()=>downloadUrl(studentBody.id, filename)">
    Öffnen
  </button>
</template>

<style scoped>
</style>