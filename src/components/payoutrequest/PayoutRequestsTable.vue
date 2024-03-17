<script setup lang="ts">
import type {INewPayoutRequestData} from "@/interfaces";
import PayoutRequestRow from "@/components/payoutrequest/PayoutRequestRow.vue";

defineProps<{
  bfsgPayoutRequests: INewPayoutRequestData[],
  singleFS: boolean,
  type: string,
}>()

</script>

<template>
  <table class="table is-narrow">
    <thead>
    <tr>
      <th>Antragsnummer</th>
      <th v-if="!singleFS">Fachschaft</th>
      <th>Referenz</th>
      <th>Kategorie</th>
      <th>Semester</th>
      <th>Betrag</th>
      <th>Status</th>
      <th></th>
    </tr>
    </thead>
    <tbody>
    <PayoutRequestRow v-for="payoutRequest in bfsgPayoutRequests" :key="payoutRequest.request_id"
                      :singleFS="singleFS" :payoutRequest="payoutRequest" :type="type"/>
    </tbody>
  </table>
</template>

<style scoped>

</style>