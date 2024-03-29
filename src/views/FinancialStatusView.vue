<script setup lang="ts">
import {RouterView, useRoute} from "vue-router";
import {computed} from "vue";
import FixedDateBanner from "@/components/FixedDateBanner.vue";

const route = useRoute()

const afsgActive = computed(()=>route.name === 'finanzuebersicht-afsg' ? 'is-active' : '')
const bfsgActive = computed(()=>route.name === 'finanzuebersicht-bfsg' ? 'is-active' : '')
</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">Antrags-Finanzübersicht</h1>

    <div class="tabs">
      <ul>
        <li :class="afsgActive">
          <RouterLink to="/finanzuebersicht/afsg">AFSG</RouterLink>
        </li>
        <li :class="bfsgActive">
          <RouterLink to="/finanzuebersicht/bfsg">BFSG</RouterLink>
        </li>
      </ul>
    </div>

    <RouterView/>

  </div>
</template>

<style scoped>
p {
  margin-bottom: 1rem;
}
</style>
