<script setup lang="ts">
import {copyToClipboard} from "@/util";
import {type Ref, ref} from "vue";

const props = defineProps<{
  text: string,
  copyText: string | undefined,
  bold: boolean,
  tagClass: string,
}>();

const textOverride: Ref<string | null> = ref(null);
const clickCallback = () => {
  copyToClipboard(props.copyText || props.text);
  textOverride.value = 'kopiert!';
  setTimeout(() => {
    textOverride.value = null;
  }, 1000);
}
</script>

<template>
  <span :class="'tag ' + tagClass + (bold ? ' has-text-weight-bold' : '')" @click.stop="clickCallback">
    <Transition mode="out-in">
      <span v-if="textOverride">
        {{ textOverride }}
      </span>
      <span v-else>
        {{ text }}
      </span>
    </Transition>
  </span>
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