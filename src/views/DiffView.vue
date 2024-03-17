<script setup lang="ts">

import {useRoute} from "vue-router";
import {nextTick, onBeforeMount, onMounted, type Ref, ref, watch} from "vue";
import {actualDateOrNull, getPayoutRequestData, pojoToIData, scrollToHashIfPresent, updatePageTitle} from "@/util";
import type {IData, INewPayoutRequestData} from "@/interfaces";
import DiffsForFsen from "@/components/diff/DiffsForFsen.vue";

const route = useRoute();


const getDateStart = () => {
  let date = route.params.dateStart as string | undefined;
  return actualDateOrNull(date);
}

const getDateEnd = () => {
  let date = route.params.dateEnd as string | undefined;
  return actualDateOrNull(date);
}
const loadData = (url: string): Promise<IData> => {
  return fetch(url)
      .then(response => response.json())
      .then(rawdata => pojoToIData(rawdata));
};

const dateStart = ref(getDateStart());
const dateEnd = ref(getDateEnd());

const scieboStart: Ref<null | IData> = ref(null);
const afsgStart: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const bfsgStart: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const vorankuendigungStart: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const scieboEnd: Ref<null | IData> = ref(null);
const afsgEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const bfsgEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
const vorankuendigungEnd: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);


watch(dateStart, async () => {
  const url = dateStart.value ? `/data/history/${dateStart.value}-data.json` : '/data/data.json';
  scieboStart.value = await loadData(url);
  afsgStart.value = await getPayoutRequestData('afsg', dateStart.value);
  bfsgStart.value = await getPayoutRequestData('bfsg', dateStart.value);
  vorankuendigungStart.value = await getPayoutRequestData('vorankuendigung', dateStart.value);
}, {immediate: true});

watch(dateEnd, async () => {
  const url = dateEnd.value ? `/data/history/${dateEnd.value}-data.json` : '/data/data.json';
  scieboEnd.value = await loadData(url);
  afsgEnd.value = await getPayoutRequestData('afsg', dateEnd.value);
  bfsgEnd.value = await getPayoutRequestData('bfsg', dateEnd.value);
  vorankuendigungEnd.value = await getPayoutRequestData('vorankuendigung', dateEnd.value);
}, {immediate: true});

onMounted(() => scrollToHashIfPresent());

watch(() => (scieboStart.value !== null
    && afsgStart.value !== null
    && bfsgStart.value !== null
    && vorankuendigungStart.value !== null
    && scieboEnd.value !== null
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
        :scieboStart="scieboStart"
        :afsgStart="afsgStart"
        :bfsgStart="bfsgStart"
        :vorankuendigungStart="vorankuendigungStart"
        :scieboEnd="scieboEnd"
        :afsgEnd="afsgEnd"
        :bfsgEnd="bfsgEnd"
        :vorankuendigungEnd="vorankuendigungEnd"
    />
  </div>

</template>

<style scoped>

</style>