<script setup lang="ts">
import {nextTick, onBeforeMount, ref, type Ref, watch} from "vue";
import type {IElectoralRegistersStatus} from "@/interfaces";
import {loadElectoralRegistersStatus, scrollToHashIfPresent} from "@/util";
import IconCross from "@/components/icons/IconCross.vue";
import IconCheckmark from "@/components/icons/IconCheckmark.vue";

const status: Ref<null | IElectoralRegistersStatus> = ref(null);

const loadStatus = () => {
  loadElectoralRegistersStatus().then(value => status.value = value);
};

onBeforeMount(() => {
  loadStatus();
});

watch(() => (status.value !== null), async () => {
  await nextTick();
  scrollToHashIfPresent();
});
</script>

<template>
  <div class="box content" id="status">
    <h2 class="subtitle">Status</h2>
    <dl v-if="status">
      <dt>Letzte Ausführung</dt>
      <dd>{{ status.last_successful_run }}</dd>
      <dt>Letzte Änderung der Daten</dt>
      <dd>{{ status.last_data_change }}</dd>
      <dt>
        Nicht zugeordnete FAKs
        <IconCross v-if="status.unassigned_faks.length"/>
        <IconCheckmark v-else/>
      </dt>
      <dd>
        <ul v-if="status.unassigned_faks.length">
          <li v-for="fak in status.unassigned_faks" :key="fak">{{ fak }}</li>
        </ul>
        <span v-else>Keine 🙂</span>
      </dd>
    </dl>
    <div v-else>Wird geladen…</div>
  </div>
</template>

<style scoped>

</style>