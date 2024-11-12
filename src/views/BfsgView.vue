<script setup lang="ts">
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestsTable from "@/components/payoutrequest/PayoutRequestsTable.vue";
import {computed, onBeforeMount} from "vue";
import {payoutRequestToMarkdown, sortPayoutRequests, updatePageTitle} from "@/util";
import FixedDateBanner from "@/components/FixedDateBanner.vue";
import CopyableTag from "@/components/CopyableTag.vue";

const payoutRequests = usePayoutRequestStore();

const sortedPayoutRequests = computed(() => payoutRequests.bfsg ? [...payoutRequests.bfsg.values()].reduce((accumulator, value) => accumulator.concat(value), []).sort(sortPayoutRequests) : [])
const presentationText = computed(()=>'### BFSG-Anträge zur Vorstellung\n' + (sortedPayoutRequests.value.filter(value => value.status == 'VOLLSTÄNDIG').map(payoutRequestToMarkdown).join('\n') || '(keine)'))
const decisionText = computed(()=>'### BFSG-Anträge zur Abstimmung\n' + (sortedPayoutRequests.value.filter(value => value.status == 'VORGESTELLT').map(payoutRequestToMarkdown).join('\n') || '(keine)'))

onBeforeMount(()=>{
  updatePageTitle('BFSG-Anträge');
});
</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">BFSG-Anträge</h1>
    <p>
      In Zwischenablage kopieren:
      <CopyableTag text="zur Vorstellung" :copyText="presentationText" :bold="false" tagClass=""/>
      /
      <CopyableTag text="zur Abstimmung" :copyText="decisionText" :bold="false" tagClass=""/>
    </p>
    <PayoutRequestsTable :bfsgPayoutRequests="sortedPayoutRequests" :singleFS="false" type="bfsg"/>
  </div>
</template>
