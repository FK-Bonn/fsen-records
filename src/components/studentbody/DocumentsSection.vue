<script setup lang="ts">

import AngleIndicator from "@/components/icons/AngleIndicator.vue";
import {ref} from "vue";
import type {IStudentBody} from "@/interfaces";
import DocumentsList from "@/components/document/DocumentsList.vue";

defineProps<{
  studentBody: IStudentBody,
}>()

const opened = ref(false);
const toggle = () => {
  opened.value = !opened.value;
}
</script>

<template>
  <div class="card">
    <header class="card-header" @click="toggle">
      <p class="card-header-title">
        Dokumente
      </p>
      <button class="card-header-icon" aria-label="more options">
        <AngleIndicator :opened="opened"/>
      </button>
    </header>
    <DocumentsList v-if="opened" :studentBody="studentBody"/>
  </div>
</template>

<style scoped>
.card-header {
  cursor: pointer;
}
</style>
