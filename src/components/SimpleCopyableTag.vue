<script setup lang="ts">
import CopyableTag from "@/components/CopyableTag.vue";

const props = defineProps<{
  text: string,
}>();

</script>

<template>
  <CopyableTag :text="props.text" :copy-text="props.text" :bold="false" tag-class="is-light"/>
</template>

<style scoped>
.tag {
  margin-bottom: 0;
  cursor: pointer;
}

.is-strikethrough {
  text-decoration: line-through;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>