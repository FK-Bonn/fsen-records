<script setup lang="ts">
import type {IDocumentData, IDocumentHistoryData} from "@/interfaces";
import {hasFsPermission, refKey} from "@/util";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import Sha256Text from "@/components/document/Sha256Text.vue";
import {computed} from "vue";
import DownloadButton from "@/components/document/DownloadButton.vue";
import {useAccountStore} from "@/stores/account";

const props = defineProps<{
  document: IDocumentHistoryData,
  previous: IDocumentHistoryData | null,
  fs: string,
}>();

const account = useAccountStore();
const hasDifference = (previous: IDocumentHistoryData | null, current: IDocumentHistoryData, key: keyof IDocumentHistoryData): boolean => {
  return !previous || JSON.stringify(previous[key]) !== JSON.stringify(current[key]);
}

const displayDownloadButton = computed(() => account && (account.user?.admin || hasFsPermission(account.user?.permissions, props.fs, 'read_files')))
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
const deletedTimestampClass = 'has-background-light';
const obsoletedTimestampClass = 'has-background-light';
const deletedByClass = 'has-background-light';
const obsoletedByClass = 'has-background-light';


</script>
<template>
  <tr>
    <th colspan="4">{{ document.filename }} <DownloadButton
        v-if="displayDownloadButton" :fs="fs" :filename="document.filename"/></th>
  </tr>
  <tr>
    <th colspan="2" class="has-text-centered">Dokument</th>
    <th colspan="2" class="has-text-centered">Annotationen</th>
  </tr>
  <tr>
    <th :class="sha256Class">sha256</th>
    <td :class="sha256Class">
      <Sha256Text :value="document.sha256hash"/>
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
  <tr>
    <th :class="deletedTimestampClass">Gelöscht</th>
    <td :class="deletedTimestampClass">{{ document.deleted_timestamp || '-' }}</td>
    <th :class="obsoletedTimestampClass">Obsoletiert</th>
    <td :class="obsoletedTimestampClass">{{ document.obsoleted_timestamp || '-' }}</td>
  </tr>
  <tr>
    <th :class="deletedByClass">Gelöscht von</th>
    <td :class="deletedByClass">{{ document.deleted_by || '-' }}</td>
    <th :class="obsoletedByClass">Obsoletiert von</th>
    <td :class="obsoletedByClass">{{ document.obsoleted_by || '-' }}</td>
  </tr>

</template>

<style scoped>
</style>
