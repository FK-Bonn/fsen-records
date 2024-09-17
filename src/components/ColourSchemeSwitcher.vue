<script setup lang="ts">
import {computed, onBeforeMount} from "vue";
import {useColourSchemeStore} from "@/stores/colourScheme";

const colourScheme = useColourSchemeStore();

const autoClass = computed(() => colourScheme.setting === 'auto' ? 'is-bold' : '');
const lightClass = computed(() => colourScheme.setting === 'light' ? 'is-bold' : '');
const darkClass = computed(() => colourScheme.setting === 'dark' ? 'is-bold' : '');

const cycle = () => {
  colourScheme.cycle();
  setThemeData();
}

const setThemeData = () => {
  const root = document.querySelector('html');
  if (root) {
    if (colourScheme.setting !== 'auto') {
      root.dataset.theme = colourScheme.setting;
    } else {
      root.dataset.theme = undefined;
    }
  }
}

onBeforeMount(() => {
  setThemeData();
})

</script>

<template>
  <button class="button is-small mt-5" @click="cycle">
    Farbschema:&ensp;<span :class="autoClass">auto</span>
    /
    <span :class="lightClass">hell</span>
    /
    <span :class="darkClass">dunkel</span>
  </button>
</template>

<style scoped>
.is-bold {
  font-weight: bold;
}
</style>