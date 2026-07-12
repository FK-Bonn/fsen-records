<script setup lang="ts">
import type {INewPayoutRequestData} from "@/interfaces";
import PayoutRequestRow from "@/components/payoutrequest/PayoutRequestRow.vue";
import {computed, ref} from "vue";
import {euroCents} from "@/util";

const props = defineProps<{
  bfsgPayoutRequests: INewPayoutRequestData[],
  singleFS: boolean,
  type: string,
}>()

const requestIdFilter = ref('');
const fsFilter = ref('');
const referenceFilter = ref('');
const categoryFilter = ref('');
const semesterFilter = ref('');
const amountFilter = ref('');
const statusFilter = ref('');

const includesAny = (haystack: string, needleString: string) => {
  haystack = haystack.toLowerCase();
  const needles = needleString.toLowerCase().split('|');
  return needles.some(needle => haystack.includes(needle));
}

const filteredPayoutRequests = computed(() => {
  return props.bfsgPayoutRequests.filter(value =>
      includesAny(value.request_id, requestIdFilter.value)
      && includesAny(value.fs, fsFilter.value)
      && includesAny((value.reference || ''), referenceFilter.value)
      && includesAny(value.category, categoryFilter.value)
      && includesAny(value.semester, semesterFilter.value)
      && includesAny(euroCents(value.amount_cents), amountFilter.value)
      && includesAny(value.status, statusFilter.value)
  )
});

const resetFilter = ()=>{
  requestIdFilter.value = '';
  fsFilter.value = '';
  referenceFilter.value = '';
  categoryFilter.value = '';
  semesterFilter.value = '';
  amountFilter.value = '';
  statusFilter.value = '';
}

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
    <tr>
      <th><input class="input is-small" v-model="requestIdFilter" placeholder="Antragsnummer filtern…"></th>
      <th v-if="!singleFS"><input class="input is-small" v-model="fsFilter" placeholder="Fachschaft filtern…"></th>
      <th><input class="input is-small" v-model="referenceFilter" placeholder="Referenz filtern…"></th>
      <th><input class="input is-small" v-model="categoryFilter" placeholder="Kategorie filtern…"></th>
      <th><input class="input is-small" v-model="semesterFilter" placeholder="Semester filtern…"></th>
      <th><input class="input is-small" v-model="amountFilter" placeholder="Betrag filtern…"></th>
      <th><input class="input is-small" v-model="statusFilter" placeholder="Status filtern…"></th>
      <th><button class="button is-small" @click="resetFilter">Reset</button></th>
    </tr>
    </thead>
    <tbody>
    <PayoutRequestRow v-for="payoutRequest in filteredPayoutRequests" :key="payoutRequest.request_id"
                      :singleFS="singleFS" :payoutRequest="payoutRequest" :type="type"/>
    </tbody>
  </table>
</template>

<style scoped>

</style>