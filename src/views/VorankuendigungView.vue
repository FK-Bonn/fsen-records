<script setup lang="ts">
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import PayoutRequestsTable from "@/components/payoutrequest/PayoutRequestsTable.vue";
import {computed} from "vue";
import {sortPayoutRequests} from "@/util";

const payoutRequests = usePayoutRequestStore();

const sortedPayoutRequests = computed(() => payoutRequests.vorankuendigung ? [...payoutRequests.vorankuendigung.values()].reduce((accumulator, value) => accumulator.concat(value), []).sort(sortPayoutRequests) : [])
</script>

<template>
  <div class="section">
    <h2 class="title">Vorankündigungen</h2>
    <PayoutRequestsTable :bfsgPayoutRequests="sortedPayoutRequests" :singleFS="false" type="vorankuendigung"/>
  </div>
</template>
