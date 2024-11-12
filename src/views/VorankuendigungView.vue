<script setup lang="ts">
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestsTable from "@/components/payoutrequest/PayoutRequestsTable.vue";
import {computed, onBeforeMount} from "vue";
import {euroCents, payoutRequestToMarkdown, sortPayoutRequests, updatePageTitle} from "@/util";
import FixedDateBanner from "@/components/FixedDateBanner.vue";
import CopyableTag from "@/components/CopyableTag.vue";
import type {INewPayoutRequestData, IPayoutRequestData} from "@/interfaces";

const payoutRequests = usePayoutRequestStore();


const sortedPayoutRequests = computed(() => payoutRequests.vorankuendigung ? [...payoutRequests.vorankuendigung.values()].reduce((accumulator, value) => accumulator.concat(value), []).sort(sortPayoutRequests) : [])
const copyText = computed(()=>{
  return '### Vorankündigungen zur Vorstellung\n' +
      (sortedPayoutRequests.value.filter(value => value.status == 'VOLLSTÄNDIG').map(payoutRequestToMarkdown).join('\n') || '(keine)') +
      '\n### Vorankündigungen zur Abstimmung\n' +
      (sortedPayoutRequests.value.filter(value => value.status == 'VORGESTELLT').map(payoutRequestToMarkdown).join('\n') || '(keine)');
})


onBeforeMount(()=>{
  updatePageTitle('Vorankündigungen');
});
</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">Vorankündigungen</h1>
    <p>
      In Zwischenablage kopieren:
      <CopyableTag text="zur Vorstellung und zur Abstimmung" :copyText="copyText" :bold="false" tagClass=""/>
    </p>
    <PayoutRequestsTable :bfsgPayoutRequests="sortedPayoutRequests" :singleFS="false" type="vorankuendigung"/>
  </div>
</template>
