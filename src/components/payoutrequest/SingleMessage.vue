<script setup lang="ts">
import type {IMessageData} from "@/interfaces";
import {computed} from "vue";
import {DateTime} from "luxon";
import {useAllFsData} from "@/stores/allFsData";

const props = defineProps<{
  message: IMessageData,
}>()

const baseData = useAllFsData();

const authorName = computed(() => {
  if (baseData.data) {
    return baseData.data[props.message.author]?.base?.data.name || props.message.author;
  }
  return props.message.author;
})

const formattedTimestamp = computed(() => {
  const dateTime = DateTime.fromISO(props.message.timestamp).setZone('Europe/Berlin');
  return dateTime.toRelative();
})
</script>

<template>
  <div class="content pre-wrap">
    <strong :title="message.username">{{ authorName }}:</strong>
    {{ message.message }}
    <small class="text-muted is-pulled-right">{{ formattedTimestamp }}</small>
  </div>
</template>

<style scoped>
.text-muted {
  opacity: 0.5;
}

.pre-wrap {
  white-space: pre-wrap;
}
</style>
