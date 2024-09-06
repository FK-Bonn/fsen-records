<script setup lang="ts">
import {computed} from "vue";
import {jsonRepresentationIsDifferent} from "@/util";

const props = defineProps<{
  before: any,
  after: any,
}>();

const clazz = computed(()=>jsonRepresentationIsDifferent(props.before, props.after) ? 'has-background-warning' : '')
</script>

<template>
  <td>
    <pre :class="clazz">{{JSON.stringify(before, null, 2)}}</pre>
  </td>
  <td>
    <pre :class="clazz">{{JSON.stringify(after, null, 2)}}</pre>
  </td>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
}
</style>