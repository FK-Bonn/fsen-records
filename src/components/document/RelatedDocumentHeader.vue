<script setup lang="ts">
import DownloadButton from "@/components/document/DownloadButton.vue";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import {computed} from "vue";
import {Interval, VerdictCalculator} from "@/Calculator";
import DocumentName from "@/components/document/DocumentName.vue";
import type { IDocumentData} from "@/interfaces";
import DateRange from "@/components/DateRange.vue";
import {usePageSettingsStore} from "@/stores/pageSettings";
import {shortenFilename} from "@/util";

const props = defineProps<{
  document: IDocumentData,
  fs: string,
  onReference?: (document: IDocumentData) => void,
}>()
const settings = usePageSettingsStore();
const worstLevel = computed(() =>
    VerdictCalculator.getWorstAnnotationLevel(props.document.annotations)
)
const shortenedFilename = computed(() => shortenFilename(props.document.filename))
</script>

<template>
  <div class="is-flex is-flex-direction-row is-align-items-center" style="gap: 0.5rem;">
    <IconForLevel :level="worstLevel"/>
    <template v-if="settings.showFilenames">
      <code>{{ shortenedFilename }}</code>
      (
      <DateRange :interval="Interval.fromStrings(document.date_start, document.date_end || document.date_start)"/>
      )
    </template>
    <DocumentName v-else :document="document"/>
    <div class="tags mb-0" v-if="document.tags && document.tags.length > 0">
      <span v-for="tag in document.tags" :key="tag" class="tag is-light">{{ tag }}</span>
    </div>
    <DownloadButton type="button" :filename="document.filename" :fs="fs"/>
    <button v-if="onReference" class="button is-small ml-1" type="button"
            @click="onReference(document)">
      Referenzieren
    </button>
  </div>
</template>
