<script setup lang="ts">
import type {IDocumentData, IFullPayoutRequestData, INewPayoutRequestData} from "@/interfaces";
import {refKey} from "@/util";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import Sha256 from "@/components/document/Sha256.vue";
import {computed} from "vue";

const props = defineProps<{
  document: IDocumentData,
  previous: IDocumentData | null,
}>();

const hasDifference = (previous: IDocumentData | null, current: IDocumentData, key: keyof IDocumentData): boolean => {
  return !previous || JSON.stringify(previous[key]) !== JSON.stringify(current[key]);
}

const sha256Class = computed(() => hasDifference(props.previous, props.document, 'sha256hash') ? 'has-background-warning' : '')
const fileExtensionClass = computed(() => hasDifference(props.previous, props.document, 'file_extension') ? 'has-background-warning' : '')
const createdTimestampClass = computed(() => hasDifference(props.previous, props.document, 'created_timestamp') ? 'has-background-warning' : '')
const uploadedByClass = computed(() => hasDifference(props.previous, props.document, 'uploaded_by') ? 'has-background-warning' : '')
const tagsClass = computed(() => hasDifference(props.previous, props.document, 'tags') ? 'has-background-warning' : '')
const referencesClass = computed(() => hasDifference(props.previous, props.document, 'references') ? 'has-background-warning' : '')
const urlClass = computed(() => hasDifference(props.previous, props.document, 'url') ? 'has-background-warning' : '')
const annotationsClass = computed(() => hasDifference(props.previous, props.document, 'annotations') ? 'has-background-warning' : '')
const annotationCreatedClass = computed(() => hasDifference(props.previous, props.document, 'annotations_created_timestamp') ? 'has-background-warning' : '')
const annotationCreatedByClass = computed(() => hasDifference(props.previous, props.document, 'annotations_created_by') ? 'has-background-warning' : '')


</script>
<template>
  <tr>
    <th colspan="4">{{ document.filename }}</th>
  </tr>
  <tr>
    <th colspan="2" class="has-text-centered">Dokument</th>
    <th colspan="2" class="has-text-centered">Annotationen</th>
  </tr>
  <tr>
    <th :class="sha256Class">sha256</th>
    <td :class="sha256Class">
      <Sha256 :value="document.sha256hash"/>
    </td>
    <th :class="tagsClass">Tags</th>
    <td :class="tagsClass">{{ document.tags?.join(', ') }}</td>
  </tr>
  <tr>
    <th :class="fileExtensionClass">Dateiendung</th>
    <td :class="fileExtensionClass">{{ document.file_extension }}</td>
    <th :class="urlClass">URL</th>
    <td :class="urlClass">{{ document.url }}</td>
  </tr>
  <tr>
    <th></th>
    <td></td>
    <th :class="referencesClass">Referenzen</th>
    <td :class="referencesClass">
      <ul v-if="document.references">
        <li v-for="reference in document.references" :key="refKey(reference)">
          {{ JSON.stringify(reference) }}
        </li>
      </ul>
      <template v-else>–</template>
    </td>
  </tr>
  <tr>
    <th></th>
    <td></td>
    <th :class="annotationsClass">Annotationen</th>
    <td :class="annotationsClass">
      <ul v-if="document.annotations">
        <li v-for="annotation in document.annotations" :key="annotation.text">
          <IconForLevel :level="annotation.level"/>
          {{ annotation.text }}
        </li>
      </ul>
      <template v-else>–</template>
    </td>
  </tr>
  <tr>
    <th :class="createdTimestampClass">Erstellt</th>
    <td :class="createdTimestampClass">{{ document.created_timestamp || '(versteckt)' }}</td>
    <th :class="annotationCreatedClass">Erstellt</th>
    <td :class="annotationCreatedClass">{{ document.annotations_created_timestamp || '(versteckt)' }}</td>
  </tr>
  <tr>
    <th :class="uploadedByClass">Hochgeladen von</th>
    <td :class="uploadedByClass">{{ document.uploaded_by || '(versteckt)' }}</td>
    <th :class="annotationCreatedByClass">Annotiert von</th>
    <td :class="annotationCreatedByClass">{{ document.annotations_created_by || '(versteckt)' }}</td>
  </tr>

</template>

<style scoped>
</style>
