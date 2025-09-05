<script setup lang="ts">
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {computed} from "vue";
import {euroCents, toFinancialYear} from "@/util";

const props = defineProps<{
  financialYear: string,
}>()

const payoutRequests = usePayoutRequestStore();

const afsg = computed(() => [...payoutRequests.afsg?.values() || []].flat().filter(pr => ['ANGEWIESEN'].includes(pr.status)).filter(pr => toFinancialYear(pr.status_date) === props.financialYear).reduce((sum, current) => sum + current.amount_cents, 0))
const bfsg = computed(() => [...payoutRequests.bfsg?.values() || []].flat().filter(pr => ['ANGEWIESEN'].includes(pr.status)).filter(pr => toFinancialYear(pr.status_date) === props.financialYear).reduce((sum, current) => sum + current.amount_cents, 0))
const total = computed(() => afsg.value + bfsg.value)

</script>

<template>
  <tr>
    <th>{{ financialYear }}</th>
    <td>{{ euroCents(afsg) }}</td>
    <td>{{ euroCents(bfsg) }}</td>
    <td>{{ euroCents(total) }}</td>
  </tr>
</template>

<style scoped>
.table td {
  text-align: right;
}
</style>