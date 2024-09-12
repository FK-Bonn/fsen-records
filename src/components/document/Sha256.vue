<script setup lang="ts">
import {computed, ref} from "vue";

const props = defineProps<{
  value: string,
}>()

const full = ref(false);

const toggleFull = () => {
  full.value = !full.value;
}

const shortenedValue = computed(() => props.value.substring(0, 8) + '…')

</script>

<template>
  <span @click.prevent="toggleFull">
    <template v-if="full">{{ props.value }}</template>
    <template v-else>{{ shortenedValue }}</template>
  </span>
</template>

<style scoped>

</style>