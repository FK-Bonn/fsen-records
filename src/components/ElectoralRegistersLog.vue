<script setup lang="ts">
import {nextTick, onBeforeMount, ref, type Ref, watch} from "vue";
import type {IElectoralRegisterDownloadData} from "@/interfaces";
import {loadElectoralRegistersLog, scrollToHashIfPresent} from "@/util";

const log: Ref<null | IElectoralRegisterDownloadData[]> = ref(null);

const loadLog = () => {
  loadElectoralRegistersLog().then(value => log.value = value);
};

onBeforeMount(() => {
  loadLog();
});
watch(() => (log.value !== null), async () => {
  await nextTick();
  scrollToHashIfPresent();
});
</script>

<template>
  <div class="box content" id="download-log">
    <h2 class="subtitle">Download-Log</h2>
    <p>Hier werden alle Downloads von Wählendenverzeichnissen öffentlich mitprotokolliert.</p>
    <div v-if="log">
      <table class="table table-sm is-bordered">
        <thead>
        <tr>
          <th>Zeitstempel</th>
          <th>User</th>
          <th>Datei</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in log" :key="item.timestamp">
          <th>{{ item.timestamp }}</th>
          <th>{{ item.username }}</th>
          <th>{{ item.filepath }}</th>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-else>Wird geladen…</div>
  </div>
</template>

<style scoped>

</style>