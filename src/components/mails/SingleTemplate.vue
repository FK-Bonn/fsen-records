<script setup lang="ts">

import {ref} from "vue";
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

const load = ()=>{
  emit("load", props.template)
}

</script>

<template>
  <tr @click="toggleBody" class="mail-header">
      <td>{{ template.template_id }}</td>
      <td>
        <pre>{{ JSON.stringify(template.meta, null, 2) }}</pre>
      </td>
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
      <pre>{{template.body}}</pre>
    </td>
  </tr>
</template>

<style scoped>
tr.mail-header {
  cursor: pointer;
}
</style>