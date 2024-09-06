<script setup lang="ts">
import type {IDocumentData, IDocumentReference} from "@/interfaces";
import {computed, ref} from "vue";
import {jsonRepresentationIsDifferent, shortenFilename} from "../../util";
import IconForLevel from "@/components/icons/IconForLevel.vue";

const props = defineProps<{
  before: IDocumentData | null | undefined,
  after: IDocumentData | null | undefined,
}>();

const filenameFragment = (reference: IDocumentReference): string => {
  return `${reference.category}-${reference.request_id}-${reference.base_name}-${reference.date_start}--${reference.date_end}`;
}

const filenameClass = computed(() => props.before?.filename !== props.after?.filename ? 'tag is-warning' : 'tag');
const tagsClass = computed(() => jsonRepresentationIsDifferent(props.before?.tags, props.after?.tags) ? 'tag is-warning' : 'tag');
const referencesClass = computed(() => jsonRepresentationIsDifferent(props.before?.references, props.after?.references) ? 'has-background-warning' : '');
const annotationsClass = computed(() => jsonRepresentationIsDifferent(props.before?.annotations, props.after?.annotations) ? 'has-background-warning' : '');
const urlClass = computed(() => props.before?.url !== props.after?.url ? 'tag is-warning' : 'tag');
</script>

<template>
  <td>
    <ul v-if="before">
      <li><span :class="filenameClass">{{ shortenFilename(before.filename) }}</span></li>
      <li>Schlagwörter:
        <template v-if="before.tags?.length">
          <span :class="tagsClass" v-for="tag in before.tags" :key="tag">{{ tag }}</span>
        </template>
        <template v-else>
          –
        </template>
      </li>
      <li>Referenzen:
        <div :class="referencesClass">
          <template v-if="before.references?.length">
            <ul>
              <li v-for="reference in before.references" :key="JSON.stringify(reference)">
                {{ filenameFragment(reference) }}
              </li>
            </ul>
          </template>
          <template v-else>
            –
          </template>
        </div>
      </li>
      <li>Annotationen:
        <div :class="annotationsClass">
          <template v-if="before.annotations">
            <li v-for="annotation in before.annotations" :key="annotation.text">
              <IconForLevel :level="annotation.level"/>
              {{ annotation.text }}
            </li>
          </template>
          <template v-else>
            –
          </template>
        </div>
      </li>
      <li>URL: <span :class="urlClass">{{ before.url }}</span></li>
    </ul>
    <span v-else class="has-text-grey has-background-grey-lighter">(wurde neu erstellt)</span>
  </td>
  <td>
    <ul v-if="after">
      <li><span :class="filenameClass">{{ shortenFilename(after.filename) }}</span></li>
      <li>Schlagwörter:
        <template v-if="after.tags?.length">
          <span :class="tagsClass" v-for="tag in after.tags" :key="tag">{{ tag }}</span>
        </template>
        <template v-else>
          –
        </template>
      </li>
      <li>Referenzen:
        <template v-if="after.references?.length">
          <ul>
            <li v-for="reference in after.references" :key="JSON.stringify(reference)">
              {{ filenameFragment(reference) }}
            </li>
          </ul>
        </template>
        <template v-else>
          –
        </template>
      </li>
      <li>Annotationen:
        <div :class="annotationsClass">
          <template v-if="after.annotations">
            <li v-for="annotation in after.annotations" :key="annotation.text">
              <IconForLevel :level="annotation.level"/>
              {{ annotation.text }}
            </li>
          </template>
          <template v-else>
            –
          </template>
        </div>
      </li>
      <li>URL: <span :class="urlClass">{{ after.url }}</span></li>
    </ul>
    <span v-else class="has-text-grey has-background-grey-lighter">(wurde gelöscht)</span>
  </td>
</template>

<style scoped>
td {
  width: 42.5%;
}

pre {
  white-space: pre-wrap;
}

ul ul {
  padding-left: 1.5rem;
  list-style-type: disc;
}
</style>