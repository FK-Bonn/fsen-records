<script setup lang="ts">
import type {IDocumentHistoryData} from "@/interfaces";
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
const sha256Class = computed(() => hasDifference(props.previous, props.document, 'sha256hash') ? 'is-warning has-text-dark' : '')
const fileExtensionClass = computed(() => hasDifference(props.previous, props.document, 'file_extension') ? 'is-warning has-text-dark' : '')
const createdTimestampClass = computed(() => hasDifference(props.previous, props.document, 'created_timestamp') ? 'is-warning has-text-dark' : '')
const uploadedByClass = computed(() => hasDifference(props.previous, props.document, 'uploaded_by') ? 'is-warning has-text-dark' : '')
const tagsClass = computed(() => hasDifference(props.previous, props.document, 'tags') ? 'is-warning has-text-dark' : '')
const referencesClass = computed(() => hasDifference(props.previous, props.document, 'references') ? 'is-warning has-text-dark' : '')
const urlClass = computed(() => hasDifference(props.previous, props.document, 'url') ? 'is-warning has-text-dark' : '')
const annotationsClass = computed(() => hasDifference(props.previous, props.document, 'annotations') ? 'is-warning has-text-dark' : '')
const annotationCreatedClass = computed(() => hasDifference(props.previous, props.document, 'annotations_created_timestamp') ? 'is-warning has-text-dark' : '')
const annotationCreatedByClass = computed(() => hasDifference(props.previous, props.document, 'annotations_created_by') ? 'is-warning has-text-dark' : '')

const isDark = computed(() =>
    document.documentElement.dataset.theme === 'dark'
);
const metadataClass = computed(() =>
    isDark.value ? 'has-background-dark' : 'has-background-light'
);

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
    <th :class="metadataClass">Gelöscht</th>
    <td :class="metadataClass">{{ document.deleted_timestamp || '-' }}</td>
    <th :class="metadataClass">Obsoletiert</th>
    <td :class="metadataClass">{{ document.obsoleted_timestamp || '-' }}</td>
  </tr>
  <tr>
    <th :class="metadataClass">Gelöscht von</th>
    <td :class="metadataClass">{{ document.deleted_by || '-' }}</td>
    <th :class="metadataClass">Obsoletiert von</th>
    <td :class="metadataClass">{{ document.obsoleted_by || '-' }}</td>
  </tr>

</template>
