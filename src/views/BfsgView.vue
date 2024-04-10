<script setup lang="ts">
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestsTable from "@/components/payoutrequest/PayoutRequestsTable.vue";
import {computed, onBeforeMount} from "vue";
import {sortPayoutRequests, updatePageTitle} from "@/util";
import FixedDateBanner from "@/components/FixedDateBanner.vue";

const payoutRequests = usePayoutRequestStore();

const sortedPayoutRequests = computed(() => payoutRequests.bfsg ? [...payoutRequests.bfsg.values()].reduce((accumulator, value) => accumulator.concat(value), []).sort(sortPayoutRequests) : [])
onBeforeMount(()=>{
  updatePageTitle('BFSG-Anträge');
});
</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">BFSG-Anträge</h1>
    <PayoutRequestsTable :bfsgPayoutRequests="sortedPayoutRequests" :singleFS="false" type="bfsg"/>
  </div>
</template>
