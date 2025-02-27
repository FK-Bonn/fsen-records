<script setup lang="ts">
import {onBeforeMount} from "vue";
import {updatePageTitle} from "@/util";
import ElectoralRegistersStatus from "@/components/ElectoralRegistersStatus.vue";
import ElectoralRegistersDownloadList from "@/components/ElectoralRegistersDownloadList.vue";
import ElectoralRegistersLog from "@/components/ElectoralRegistersLog.vue";

onBeforeMount(() => {
  updatePageTitle('Wählendenverzeichnisse');
});

</script>

<template>
  <div class="container section">
    <h1 class="title is-1">Wählendenverzeichnisse</h1>

    <div class="notification is-warning">
      <strong>Obacht!</strong>
      Diese Funktionalität wird voraussichtlich erst ab Wintersemester 2025/26 nutzbar sein.
    </div>

    <ElectoralRegistersStatus/>
    <ElectoralRegistersDownloadList/>
    <ElectoralRegistersLog/>
  </div>
</template>
