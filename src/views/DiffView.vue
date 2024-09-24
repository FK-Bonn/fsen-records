<script setup lang="ts">

import {useRoute} from "vue-router";
import {nextTick, onBeforeMount, onMounted, type Ref, ref, watch} from "vue";
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
const documentsStart: Ref<null | IDocumentDataForFs> = ref(null);
const fsDataEnd: Ref<null | IAllFsData> = ref(null);
const afsgEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const bfsgEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const vorankuendigungEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const documentsEnd: Ref<null | IDocumentDataForFs> = ref(null);


watch(dateStart, async () => {
  fsDataStart.value = await getAllFsData(token.apiToken, dateStart.value);
  afsgStart.value = await getPayoutRequestData('afsg', dateStart.value);
  bfsgStart.value = await getPayoutRequestData('bfsg', dateStart.value);
  vorankuendigungStart.value = await getPayoutRequestData('vorankuendigung', dateStart.value);
  documentsStart.value = await getDocumentData(dateStart.value);
}, {immediate: true});

watch(dateEnd, async () => {
  fsDataEnd.value = await getAllFsData(token.apiToken, dateEnd.value);
  afsgEnd.value = await getPayoutRequestData('afsg', dateEnd.value);
  bfsgEnd.value = await getPayoutRequestData('bfsg', dateEnd.value);
  vorankuendigungEnd.value = await getPayoutRequestData('vorankuendigung', dateEnd.value);
  documentsEnd.value = await getDocumentData(dateEnd.value);
}, {immediate: true});

onMounted(() => scrollToHashIfPresent());

watch(() => (fsDataStart.value !== null
    && afsgStart.value !== null
    && bfsgStart.value !== null
    && vorankuendigungStart.value !== null
    && fsDataEnd.value !== null
    && afsgEnd.value !== null
    && bfsgEnd.value !== null
    && vorankuendigungEnd.value !== null), async () => {
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