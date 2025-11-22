<script setup lang="ts">
import {deNow} from "@/util";
import {computed} from "vue";

const semesters = computed(() => {
  const now = deNow();
  if (now.month < 4) {
    return [
      {id: `${now.year - 1}-WiSe`, name: `Wintersemester ${now.year - 1}/${now.year.toString().substring(2)}`},
      {id: `${now.year}-SoSe`, name: `Sommersemester ${now.year}`},
    ];
  } else if (now.month < 10) {
    return [
      {id: `${now.year}-SoSe`, name: `Sommersemester ${now.year}`},
      {id: `${now.year}-WiSe`, name: `Wintersemester ${now.year}/${(now.year + 1).toString().substring(2)}`},
    ];
  } else {
    return [
      {id: `${now.year}-WiSe`, name: `Wintersemester ${now.year}/${(now.year + 1).toString().substring(2)}`},
      {id: `${now.year + 1}-SoSe`, name: `Sommersemester ${now.year + 1}`},
    ];
  }

})
</script>

<template>
  <template v-for="semester in semesters" :key="semester.id">
    <option :value="semester.id">{{ semester.name }}</option>
  </template>
</template>

<style scoped>

</style>
