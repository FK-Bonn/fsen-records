<script setup lang="ts">

import {AnnotationLevel, type IBaseFsData, type IDocumentData, type IDocumentReference} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import IconCross from "@/components/icons/IconCross.vue";
import IconQuestionmark from "@/components/icons/IconQuestionmark.vue";
import {VerdictCalculator} from "@/Calculator";
import SingleDocumentWithoutReferences from "@/components/document/SingleDocumentWithoutReferences.vue";
import {usePageSettingsStore} from "@/stores/pageSettings";
import SingleDocument from "@/components/document/SingleDocument.vue";
import {useDocumentsStore} from "@/stores/documents";
import {isReferenced, refKey} from "@/util";

const props = defineProps<{
  title: string,
  proceedingsTitle: string,
  overallLevel: AnnotationLevel,
  documents: IDocumentData[],
  covered: boolean,
  baseData: IBaseFsData,
}>()

const settings = usePageSettingsStore();
const documentsStore = useDocumentsStore();

const getReferencedDocument = (reference: IDocumentReference): IDocumentData | null => {
  if (!documentsStore.data) {
    return null;
  }
  const documentsForFs = documentsStore.data[props.baseData.fs_id];
  return documentsForFs.find(value => isReferenced(value, [reference])) || null;
}

</script>

<template>
  <h5 class="title is-5">
    <IconForLevel :level="overallLevel"/>
    {{ title }}
  </h5>
  <div :class="('documents level-'+overallLevel) + (settings.paleLowerDocuments ? ' pale' : '')">
    <ul v-if="documents.length > 0 && !covered">
      <li>
        <IconCross/>
        Zeitraum nicht vollständig abgedeckt
      </li>
    </ul>
    <template v-for="document in documents" :key="document.filename">
      <div :class="'document level-'+VerdictCalculator.getWorstAnnotationLevel(document.annotations)">
        <SingleDocumentWithoutReferences :document="document" :fsId="baseData.fs_id"/>
        <ul class="prots">
          <li v-for="reference in document.references" :key="refKey(reference)">
            <b>{{ proceedingsTitle }}:</b><br>
            <SingleDocument :document="getReferencedDocument(reference)" :fsId="baseData.fs_id"/>
          </li>
          <li v-if="(document.references?.length || 0) === 0">
            <b>{{ proceedingsTitle }}:</b>
            <IconCross v-if="document.annotations === null"/>
            <IconQuestionmark v-else/>
            ?
          </li>
        </ul>
      </div>
    </template>
    <template v-if="documents.length === 0">
      <IconCross/>
      Fehlt!
    </template>
  </div>
</template>

<style scoped>
h5.title {
  border-bottom: 1px solid #ccc;
  border-image: linear-gradient(90deg, #ccc, #fff) 1;
  padding-bottom: .2em;
  padding-top: .3em;
  margin: 0 0 .5em 0;
}

ul, ul:not(:last-child) {
  margin-top: 0;
  margin-left: 0;
  list-style: none !important;
}

ul.prots {
  margin-left: 1em;
}

.pale.documents.level-Ok .document.level-Warning,
.pale.documents.level-Ok .document.level-Error,
.pale.documents.level-Warning .document.level-Error {
  opacity: 0.3;
}
</style>