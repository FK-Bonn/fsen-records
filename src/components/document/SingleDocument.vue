<script setup lang="ts">
import type {IDocumentData, IStudentBody} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import IconQuestionmark from "@/components/icons/IconQuestionmark.vue";
import DateRange from "@/components/DateRange.vue";
import {Interval, VerdictCalculator} from "@/Calculator";
import DownloadButton from "@/components/document/DownloadButton.vue";
import {computed, ref} from "vue";
import {useAccountStore} from "@/stores/account";
import {hasFsPermission, shortenFilename} from "@/util";
import {usePageSettingsStore} from "@/stores/pageSettings";
import DocumentName from "@/components/document/DocumentName.vue";
import RequestHistoryModal from "@/components/payoutrequest/RequestHistoryModal.vue";
import AnnotationsEditModal from "@/components/document/AnnotationsEditModal.vue";

const props = defineProps<{
  document: IDocumentData | null,
  withReferences?: boolean,
  studentBody: IStudentBody,
}>()

const account = useAccountStore();
const settings = usePageSettingsStore();

const annotationsEditModal = ref(false);

const showAnnotationEditModal = () => {
  annotationsEditModal.value = true;
}

const displayDownloadButton = computed(() => account && (account.user?.admin || hasFsPermission(account.user?.permissions, props.studentBody.id, 'read_files')))
const displayEditAnnotationsButton = computed(() => account && (account.user?.admin))
const shortenedFilename = computed(() => shortenFilename(props.document?.filename))

</script>

<template>
  <template v-if="document === null"></template>
  <template v-else>
    <IconForLevel v-if="document" :level="VerdictCalculator.getWorstAnnotationLevel(document.annotations)"/>
    <IconQuestionmark v-else/>
    <template v-if="settings.showFilenames">
      <code>{{ shortenedFilename }}</code>
      (
      <DateRange :interval="Interval.fromStrings(document.date_start, document.date_end || document.date_start)"/>
      )
    </template>
    <DocumentName v-else :document="document"/>

    <div class="tags" v-if="document.tags && document.tags.length > 0">
      <span v-for="tag in document.tags" :key="tag" class="tag is-light">{{ tag }}</span>
    </div>

    <DownloadButton v-if="displayDownloadButton" :studentBody="studentBody" :filename="document.filename"/>

    <button class="button is-small" v-if="displayEditAnnotationsButton" @click="showAnnotationEditModal"
            title="Annotationen bearbeiten">✏️
    </button>

    <template v-if="withReferences">
      <template v-if="document.url">
        <a :href="document.url">Link</a>
      </template>
      <template v-for="reference in document.references" :key="reference">
        <code>{{ reference }}</code>
      </template>
    </template>
    <ul v-if="document.annotations">
      <li v-for="annotation in document.annotations" :key="annotation.text">
        <IconForLevel :level="annotation.level"/>
        {{ annotation.text }}
      </li>
    </ul>

    <AnnotationsEditModal v-if="annotationsEditModal" :fs="studentBody.id" :document="document" v-model="annotationsEditModal"/>

  </template>
</template>
<style scoped>
.tags {
  display: inline-block;
  margin: 0;
}

.tag {
  margin: 0 .2rem;
}

ul, ul:not(:last-child) {
  list-style: none !important;
  margin-top: .2em !important;
  margin-bottom: .1em;
}
</style>