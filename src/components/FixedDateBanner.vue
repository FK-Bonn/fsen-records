<script setup lang="ts">

import {useFixedDateStore} from "@/stores/fixedDate";

const fixedDate = useFixedDateStore();

const reset = () => fixedDate.reset();
</script>

<template>
  <template v-if="fixedDate.date">
    <div class="box has-background-grey-dark has-text-centered has-text-weight-bold has-text-white">
      <span>Stand von {{ fixedDate.date }}</span>
      <button class="button is-small is-pulled-right" @click="reset">Zurücksetzen</button>
    </div>
  </template>
</template>

<style scoped>
</style>