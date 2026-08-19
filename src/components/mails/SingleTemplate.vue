<script setup lang="ts">

import {computed, ref} from "vue";
import type {IEmailTemplateDataWithMeta, IQueuedEmailMessage, ISentEmailMessage} from "@/interfaces";

const props = defineProps<{
  template: IEmailTemplateDataWithMeta,
}>()

const emit = defineEmits<{
  load: IEmailTemplateDataWithMeta[]
}>()

const displayBody = ref(false);

const toggleBody = () => {
  displayBody.value = !displayBody.value;
}

const load = () => {
  emit("load", props.template)
}

const schedule = computed(() => {
  const items = [];
  const meta = props.template.meta;
  for (const fixedDate of meta.fixed_dates ?? []) {
    items.push(`${String(fixedDate.day).padStart(2, "0")}.${String(fixedDate.month).padStart(2, "0")}.`);
  }
  if (meta.frequency !== null) {
    switch (meta.frequency) {
      case "daily":
        items.push("täglich");
        break;
      case "weekly":
        items.push("wöchentlich");
        break;
      case "monthly":
        items.push("monatlich");
        break;
      default:
        items.push(meta.frequency);
    }
  }
  if (meta.days_before !== null) {
    if (meta.days_before >= 0) {
      items.push(`${meta.days_before} Tage vorher`);
    } else {
      items.push(`${-meta.days_before} Tage später`);
    }
  }
  return items.join(', ');
})

</script>

<template>
  <tr @click="toggleBody" class="mail-header">
    <td><code>{{ template.template_id }}</code></td>
    <td>
      <div class="tags">
        <span class="tag" v-for="target in props.template.meta.targets" :key="target">{{ target }}</span>
      </div>
    </td>
    <td>{{ schedule }}</td>
    <td>{{ template.subject }}</td>
    <td>
          <span :title="template.last_modified_timestamp">
            {{ template.last_modified_timestamp.substring(0, 10) }}
          </span>
      von {{ template.last_modified_by }}
    </td>
    <td>
      <button class="button" @click="load">Bearbeiten</button>
    </td>
  </tr>
  <tr v-if="displayBody">
    <td colspan="5">
      <pre>{{ template.body }}</pre>
    </td>
  </tr>
</template>

<style scoped>
tr.mail-header {
  cursor: pointer;
}
</style>