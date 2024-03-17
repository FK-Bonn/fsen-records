<script setup lang="ts">
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestsTable from "@/components/payoutrequest/PayoutRequestsTable.vue";
import {computed, onBeforeMount} from "vue";
import {sortPayoutRequests, updatePageTitle} from "@/util";
import FixedDateBanner from "@/components/FixedDateBanner.vue";

const payoutRequests = usePayoutRequestStore();

const sortedPayoutRequests = computed(() => payoutRequests.vorankuendigung ? [...payoutRequests.vorankuendigung.values()].reduce((accumulator, value) => accumulator.concat(value), []).sort(sortPayoutRequests) : [])

onBeforeMount(()=>{
  updatePageTitle('Vorankündigungen');
});
</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">Vorankündigungen</h1>
    <PayoutRequestsTable :bfsgPayoutRequests="sortedPayoutRequests" :singleFS="false" type="vorankuendigung"/>
  </div>
</template>
