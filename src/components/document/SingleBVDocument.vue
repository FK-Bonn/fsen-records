<script setup lang="ts">
import type {IBaseFsData, IDocumentData} from "@/interfaces";
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
import AnnotationsEditModal from "@/components/document/AnnotationsEditModal.vue";
import DeleteModal from "@/components/document/DeleteModal.vue";
import DocumentHistoryModal from "@/components/document/DocumentHistoryModal.vue";

const props = defineProps<{
  document: IDocumentData | null,
  fsId: string,
}>()

const emit = defineEmits<{
  reloadDocuments: []
}>()

const account = useAccountStore();
const settings = usePageSettingsStore();

const annotationsEditModal = ref(false);
const deleteModal = ref(false);
const historyModal = ref(false);

const showAnnotationEditModal = () => {
  annotationsEditModal.value = true;
}

const showDeleteModal = () => {
  deleteModal.value = true;
}

const showHistoryModal = () => {
  historyModal.value = true;
}

const reloadDocuments = ()=>{
  emit('reloadDocuments');
}

const displayDownloadButton = computed(() => account && (account.user?.admin || hasFsPermission(account.user?.permissions, props.fsId, 'read_files')))
const displayEditAnnotationsButton = computed(() => account && (account.user?.admin))
const displayDeleteButton = computed(() => account && (account.user?.admin))
const shortenedFilename = computed(() => shortenFilename(props.document?.filename))

</script>

<template>
  <template v-if="document === null"></template>
  <template v-else>
    <div class="single-document">
      <div class="is-flex flex-direction-row is-align-items-center is-column-gap-0.5">
        <IconForLevel v-if="document" :level="VerdictCalculator.getWorstAnnotationLevel(document.annotations)"/>
        <IconQuestionmark v-else/>
        <div class="tags" v-if="document.tags && document.tags.length > 0">
          <span v-for="tag in document.tags" :key="tag" class="tag is-light">{{ tag }}</span>
        </div>
        <strong>{{ document.base_name }}</strong>
        <template v-if="settings.showFilenames">
          <code>{{ shortenedFilename }}</code>
        </template>

        <div class="field is-grouped">
          <p class="control">
            <DownloadButton v-if="displayDownloadButton" :fs="fsId" :filename="document.filename"/>
          </p>
          <p class="control">
            <button class="button is-small" @click.stop="showHistoryModal" title="Bearbeitungsverlauf anzeigen">
              📜
            </button>
          </p>
          <p class="control">
            <button class="button is-small" v-if="displayEditAnnotationsButton" @click="showAnnotationEditModal"
                    title="Annotationen bearbeiten">✏️
            </button>
          </p>
          <p class="control">
            <button class="button is-small" v-if="displayDeleteButton" @click="showDeleteModal"
                    title="Datei(version) löschen">🚮
            </button>
          </p>
        </div>
      </div>

      <ul v-if="document.annotations">
        <li v-for="annotation in document.annotations" :key="annotation.text">
          <IconForLevel :level="annotation.level"/>
          {{ annotation.text }}
        </li>
      </ul>
    </div>

    <AnnotationsEditModal v-if="annotationsEditModal" :fs="fsId" :document="document" v-model="annotationsEditModal" @saved="reloadDocuments()"/>

    <DeleteModal v-if="deleteModal" :fs="fsId" :document="document" v-model="deleteModal" @deleted="reloadDocuments()"/>

    <DocumentHistoryModal v-if="historyModal" :fs="fsId" :document="document" v-model="historyModal"/>

  </template>
</template>
<style scoped>
.tags {
  display: inline-block;
  margin-bottom: 0;
}

.tag, p.control {
  margin-bottom: 0;
}

ul, ul:not(:last-child) {
  list-style: none !important;
  margin-top: .2em !important;
  margin-bottom: .1em;
}

.pale.documents.level-Ok .document.level-Warning .single-document,
.pale.documents.level-Ok .document.level-Error .single-document,
.pale.documents.level-Warning .document.level-Error .single-document {
  opacity: 0.3;
}
</style>