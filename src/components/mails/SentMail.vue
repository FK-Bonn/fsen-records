<script setup lang="ts">

import {ref} from "vue";
import type {IQueuedEmailMessage, ISentEmailMessage} from "@/interfaces";

defineProps<{
  mail: ISentEmailMessage,
}>()
const displayBody = ref(false);

const toggleBody = () => {
  displayBody.value = !displayBody.value;
}
</script>

<template>
  <tr @click="toggleBody" class="mail-header">
    <td>{{ mail.template_id }}</td>
    <td>
      <ul>
        <li v-for="recipient in mail.to" :key="recipient">
          {{ recipient }}
        </li>
      </ul>
    </td>
    <td>{{ mail.subject }}</td>
    <td>
          <span :title="mail.created">
            {{ mail.created.substring(0, 10) }}
          </span>
    </td>
    <td>{{ mail.sent.replace('T', ' ') }}</td>
  </tr>
  <tr v-if="displayBody" class="mail-body">
    <td colspan="5">
      <pre>{{ mail.body }}</pre>
    </td>
  </tr>
</template>

<style scoped>
tr.mail-header {
  cursor: pointer;
}
</style>