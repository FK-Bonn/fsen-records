<script setup lang="ts">

import {useRoute} from "vue-router";
import {computed, nextTick, onBeforeMount, onMounted, type Ref, ref, watch} from "vue";
import {
  actualDateOrNull,
  getAllFsData,
  getDocumentData,
  getPayoutRequestData,
  scrollToHashIfPresent,
  updatePageTitle
} from "@/util";
import type {IAllFsData, IDocumentDataForFs, INewPayoutRequestData} from "@/interfaces";
import DiffsForFsen from "@/components/diff/DiffsForFsen.vue";
import {useTokenStore} from "@/stores/token";

const route = useRoute();
const token = useTokenStore();

const getDateStart = () => {
  let date = route.params.dateStart as string | undefined;
  return actualDateOrNull(date);
}

const getDateEnd = () => {
  let date = route.params.dateEnd as string | undefined;
  return actualDateOrNull(date);
}

const dateStart = ref(getDateStart());
const dateEnd = ref(getDateEnd());

const fsDataStart: Ref<null | IAllFsData> = ref(null);
const afsgStart: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const bfsgStart: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const vorankuendigungStart: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const aDocumentsStart: Ref<null | IDocumentDataForFs> = ref(null);
const bDocumentsStart: Ref<null | IDocumentDataForFs> = ref(null);
const vDocumentsStart: Ref<null | IDocumentDataForFs> = ref(null);
const fsDataEnd: Ref<null | IAllFsData> = ref(null);
const afsgEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const bfsgEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const vorankuendigungEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const aDocumentsEnd: Ref<null | IDocumentDataForFs> = ref(null);
const bDocumentsEnd: Ref<null | IDocumentDataForFs> = ref(null);
const vDocumentsEnd: Ref<null | IDocumentDataForFs> = ref(null);

const documentsStart = computed(()=>{
  const documents: IDocumentDataForFs = {};
  for(const docs of [aDocumentsStart.value, bDocumentsStart.value, vDocumentsStart.value]){
    if(!docs){
      continue;
    }
    for (let fs of Object.keys(docs)) {
      if (!Object.prototype.hasOwnProperty.call(documents, fs)){
        documents[fs] = [];
      }
      documents[fs] = documents[fs].concat(docs[fs]);
    }
  }
  return documents;
})
const documentsEnd = computed(()=>{
  const documents: IDocumentDataForFs = {};
  for(const docs of [aDocumentsEnd.value, bDocumentsEnd.value, vDocumentsEnd.value]){
    if(!docs){
      continue;
    }
    for (let fs of Object.keys(docs)) {
      if (!Object.prototype.hasOwnProperty.call(documents, fs)){
        documents[fs] = [];
      }
      documents[fs] = documents[fs].concat(docs[fs]);
    }
  }
  return documents;
})

watch(dateStart, async () => {
  fsDataStart.value = await getAllFsData(token.token(), dateStart.value);
  afsgStart.value = await getPayoutRequestData('afsg', dateStart.value);
  bfsgStart.value = await getPayoutRequestData('bfsg', dateStart.value);
  vorankuendigungStart.value = await getPayoutRequestData('vorankuendigung', dateStart.value);
  aDocumentsStart.value = await getDocumentData(dateStart.value, 'AFSG');
  bDocumentsStart.value = await getDocumentData(dateStart.value, 'BFSG');
  vDocumentsStart.value = await getDocumentData(dateStart.value, 'VORANKUENDIGUNG');
}, {immediate: true});

watch(dateEnd, async () => {
  fsDataEnd.value = await getAllFsData(token.token(), dateEnd.value);
  afsgEnd.value = await getPayoutRequestData('afsg', dateEnd.value);
  bfsgEnd.value = await getPayoutRequestData('bfsg', dateEnd.value);
  vorankuendigungEnd.value = await getPayoutRequestData('vorankuendigung', dateEnd.value);
  aDocumentsEnd.value = await getDocumentData(dateEnd.value, 'AFSG');
  bDocumentsEnd.value = await getDocumentData(dateEnd.value, 'BFSG');
  vDocumentsEnd.value = await getDocumentData(dateEnd.value, 'VORANKUENDIGUNG');
}, {immediate: true});

onMounted(() => scrollToHashIfPresent());

watch(() => (fsDataStart.value !== null
    && afsgStart.value !== null
    && bfsgStart.value !== null
    && vorankuendigungStart.value !== null
    && aDocumentsStart.value !== null
    && bDocumentsStart.value !== null
    && vDocumentsStart.value !== null
    && fsDataEnd.value !== null
    && afsgEnd.value !== null
    && bfsgEnd.value !== null
    && vorankuendigungEnd.value !== null
    && aDocumentsEnd.value !== null
    && bDocumentsEnd.value !== null
    && vDocumentsEnd.value !== null
), async () => {
  await nextTick();
  scrollToHashIfPresent();
});

onBeforeMount(()=>{
  updatePageTitle('Änderungen');
});

</script>

<template>
  <div class="container section">
    <h1 class="title is-1">
      Änderungen zwischen <code>{{ dateStart }}</code> und <code>{{ dateEnd || 'jetzt' }}</code>
    </h1>

    <DiffsForFsen
        :fsDataStart="fsDataStart"
        :afsgStart="afsgStart"
        :bfsgStart="bfsgStart"
        :vorankuendigungStart="vorankuendigungStart"
        :documentsStart="documentsStart"
        :fsDataEnd="fsDataEnd"
        :afsgEnd="afsgEnd"
        :bfsgEnd="bfsgEnd"
        :vorankuendigungEnd="vorankuendigungEnd"
        :documentsEnd="documentsEnd"
    />
  </div>

</template>

<style scoped>

</style>