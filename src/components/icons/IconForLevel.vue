<script setup lang="ts">
import IconCheckmark from "@/components/icons/IconCheckmark.vue";
import IconQuestionmark from "@/components/icons/IconQuestionmark.vue";
import IconWarning from "@/components/icons/IconWarning.vue";
import IconCross from "@/components/icons/IconCross.vue";
import IconInfo from "@/components/icons/IconInfo.vue";
import IconObsolete from "@/components/icons/IconObsolete.vue";
import {AnnotationLevel} from "@/interfaces";

defineProps<{
  title?: string,
  level: AnnotationLevel,
}>()

</script>

<template>
  <IconCheckmark v-if="level === AnnotationLevel.Ok" :title="title"/>
  <IconQuestionmark v-else-if="level === AnnotationLevel.Unchecked" :title="title"/>
  <IconInfo v-else-if="level === AnnotationLevel.Info" :title="title"/>
  <IconWarning v-else-if="level === AnnotationLevel.Warning" :title="title"/>
  <IconCross v-else-if="level === AnnotationLevel.Error" :title="title"/>
  <IconObsolete v-else-if="level === AnnotationLevel.Obsolete" :title="title"/>
  <template v-else>?</template>
</template>

<style scoped>
</style>