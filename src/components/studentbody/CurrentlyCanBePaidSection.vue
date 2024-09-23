<script setup lang="ts">
import type {IBaseFsData} from "@/interfaces";
import {computed, ref} from "vue";
import {CurrentlyCanBePaidCalculator} from "@/Calculator";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import AngleIndicator from "@/components/icons/AngleIndicator.vue";
import CurrentlyCanBePaidContent from "@/components/studentbody/CurrentlyCanBePaidContent.vue";
import {useFixedDateStore} from "@/stores/fixedDate";
import {useDocumentsStore} from "@/stores/documents";

const props = defineProps<{
  baseData: IBaseFsData,
}>()

const fixedDate = useFixedDateStore();
const documents = useDocumentsStore();

const opened = ref(false);
const toggle = () => {
  opened.value = !opened.value;
}
const calculateLevel = (baseData: IBaseFsData, fixedDate: string | null) => {
  const calculator = new CurrentlyCanBePaidCalculator(baseData, fixedDate, documents.data);
  return calculator.calculateOverallLevel();
}

const level = computed(() => calculateLevel(props.baseData, fixedDate.date))
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
    <CurrentlyCanBePaidContent v-if="opened" :baseData="baseData"/>
  </div>
</template>

<style scoped>
.card-header {
  cursor: pointer;
}
</style>