<script setup lang="ts">
import type {IAnnotatedDocument, IStudentBody} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import IconQuestionmark from "@/components/icons/IconQuestionmark.vue";
import DateRange from "@/components/DateRange.vue";
import {Interval, VerdictCalculator} from "@/Calculator";
import DocumentName from "@/components/document/DocumentName.vue";
import DownloadButton from "@/components/document/DownloadButton.vue";
import {computed} from "vue";
import {useAccountStore} from "@/stores/account";
import {hasFsPermission} from "@/util";
import {usePageSettingsStore} from "@/stores/pageSettings";

const props = defineProps<{
  document: IAnnotatedDocument,
  withReferences?: boolean,
  studentBody: IStudentBody,
}>()

const account = useAccountStore();
const settings = usePageSettingsStore();

const displayDownloadButton = computed(() => account && (account.user?.admin || hasFsPermission(account.user?.permissions, props.studentBody.id, 'read_files')))

</script>

<template>
  <IconForLevel v-if="document.checked" :level="VerdictCalculator.getWorstAnnotationLevel(document.annotations)"/>
  <IconQuestionmark v-else/>
  <template v-if="settings.showFilenames">
    <code>{{ document.filename }}</code>
    (
    <DateRange :interval="Interval.fromStrings(document.dateStart, document.dateEnd || document.dateStart)"/>
    )
  </template>
  <DocumentName v-else :document="document"/>

  <DownloadButton v-if="displayDownloadButton" :studentBody="studentBody" :filename="document.filename"/>

  <template v-if="withReferences">
    <template v-for="reference in document.references" :key="reference">
      <template v-if="reference.startsWith('https://')">
        <a :href="reference">Link</a>
      </template>
      <template v-else>
        <code>{{ reference }}</code>
      </template>
    </template>
  </template>
  <ul v-if="document.annotations.length > 0">
    <template>
      <li v-for="annotation in document.annotations" :key="annotation.text">
        <IconForLevel :level="annotation.level"/>
        {{ annotation.text }}
      </li>
    </template>
  </ul>
</template>

<style scoped>
ul, ul:not(:last-child) {
  list-style: none !important;
  margin-top: .2em !important;
  margin-bottom: .1em;
}
</style>