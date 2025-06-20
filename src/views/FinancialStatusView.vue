<script setup lang="ts">
import {RouterView, useRoute} from "vue-router";
import {computed, onBeforeMount} from "vue";
import FixedDateBanner from "@/components/FixedDateBanner.vue";
import {updatePageTitle} from "@/util";
import FinancialStatusAfsgView from "@/views/FinancialStatusAfsgView.vue";
import FinancialStatusBfsgView from "@/views/FinancialStatusBfsgView.vue";
import CashFlowView from "@/views/CashFlowView.vue";

onBeforeMount(()=>{
  updatePageTitle('Antrags-Finanzübersicht');
});
</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">Antrags-Finanzübersicht</h1>

    <div class="content">

      <FinancialStatusAfsgView/>

      <FinancialStatusBfsgView/>

      <CashFlowView/>

    </div>
  </div>
</template>

<style scoped>
p {
  margin-bottom: 1rem;
}
</style>
