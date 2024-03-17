<script setup lang="ts">
import type {IStudentBody} from "@/interfaces";
import {computed, ref} from "vue";
import {CurrentlyCanBePaidCalculator} from "@/Calculator";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import AngleIndicator from "@/components/icons/AngleIndicator.vue";
import CurrentlyCanBePaidContent from "@/components/studentbody/CurrentlyCanBePaidContent.vue";

const props = defineProps<{
  studentBody: IStudentBody,
}>()

const opened = ref(false);
const toggle = () => {
  opened.value = !opened.value;
}
const calculateLevel = (studentBody: IStudentBody, fixedDate: string | null) => {
  const calculator = new CurrentlyCanBePaidCalculator(studentBody, fixedDate);
  return calculator.calculateOverallLevel();
}

const level = computed(() => calculateLevel(props.studentBody, null))
</script>

<template>
  <div class="card">
    <header class="card-header" @click=toggle>
      <p class="card-header-title">
        <IconForLevel :level="level"/> Auszahlungsfähigkeit
      </p>
      <button class="card-header-icon" aria-label="more options">
        <AngleIndicator :opened="opened"/>
      </button>
    </header>
    <CurrentlyCanBePaidContent v-if="opened" :studentBody="studentBody"/>
  </div>
</template>

<style scoped>
.card-header {
  cursor: pointer;
}
</style>