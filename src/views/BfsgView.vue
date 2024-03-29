<script setup lang="ts">
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestsTable from "@/components/payoutrequest/PayoutRequestsTable.vue";
import {computed} from "vue";
import {sortPayoutRequests} from "@/util";
import FixedDateBanner from "@/components/FixedDateBanner.vue";

const payoutRequests = usePayoutRequestStore();

const sortedPayoutRequests = computed(() => payoutRequests.bfsg ? [...payoutRequests.bfsg.values()].reduce((accumulator, value) => accumulator.concat(value), []).sort(sortPayoutRequests) : [])
</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">BFSG-Anträge</h1>
    <PayoutRequestsTable :bfsgPayoutRequests="sortedPayoutRequests" :singleFS="false" type="vorankuendigung"/>
  </div>
</template>
