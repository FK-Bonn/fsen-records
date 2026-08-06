<script setup lang="ts">

import {ref} from "vue";
import type {IQueuedEmailMessage} from "@/interfaces";

defineProps<{
  mail: IQueuedEmailMessage,
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
    <td>{{ mail.not_before }}</td>
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