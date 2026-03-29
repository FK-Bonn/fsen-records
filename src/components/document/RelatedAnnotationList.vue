<script setup lang="ts">
import type {IAnnotation} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";

const props = defineProps<{
  annotations?: IAnnotation[] | null,
  onAdopt?: (annotation: IAnnotation) => void,
}>()

</script>

<template>
  <template v-if="props.annotations?.length === 0">
    <p class="ml-5 mt-1">Das Dokument hat keine Annotationen.</p>
  </template>
  <ul v-else-if="annotations" class="ml-4 mt-1">
    <li v-for="annotation in annotations" :key="annotation.text"
        class="is-flex is-align-items-center">
      <IconForLevel :level="annotation.level"/>
      <p class="ml-1 mb-0">{{ annotation.text }}</p>
      <button v-if="onAdopt" class="button is-small ml-4" type="button"
              @click="onAdopt(annotation)">
        Übernehmen
      </button>
    </li>
  </ul>
</template>
