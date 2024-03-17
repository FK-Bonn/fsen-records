<script setup lang="ts">
import {RouterView} from "vue-router";
</script>

<template>
  <div class="section">

      <h1 class="title">Finanzübersicht</h1>

    <ul>
      <li><RouterLink to="/finanzuebersicht/afsg">AFSG</RouterLink></li>
      <li><RouterLink to="/finanzuebersicht/bfsg">BFSG</RouterLink></li>
    </ul>

    <RouterView/>

  </div>
</template>
