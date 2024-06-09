<script setup lang="ts">
defineProps<{
  before: any,
  after: any,
}>();
</script>

<template>
  <td>
    <pre>{{JSON.stringify(before, null, 2)}}</pre>
  </td>
  <td>
    <pre>{{JSON.stringify(after, null, 2)}}</pre>
  </td>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
}
</style>