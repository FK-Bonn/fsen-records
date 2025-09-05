<script setup lang="ts">
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {computed} from "vue";
import {euroCents} from "@/util";

const props = defineProps<{
  semester: string,
}>()

const payoutRequests = usePayoutRequestStore();

const afsgRequested = computed(() => [...payoutRequests.afsg?.values() || []].flat().filter(pr => pr.semester === props.semester).reduce((sum, current) => sum + current.amount_cents, 0))
const afsgRequired = computed(() => [...payoutRequests.afsg?.values() || []].flat().filter(pr => pr.semester === props.semester).filter(pr => ['ANGEWIESEN'].includes(pr.status)).reduce((sum, current) => sum + current.amount_cents, 0))
const bfsgRequested = computed(() => [...payoutRequests.bfsg?.values() || []].flat().filter(pr => pr.semester === props.semester).reduce((sum, current) => sum + current.amount_cents, 0))
const bfsgRequired = computed(() => [...payoutRequests.bfsg?.values() || []].flat().filter(pr => pr.semester === props.semester).filter(pr => ['ANGEWIESEN'].includes(pr.status)).reduce((sum, current) => sum + current.amount_cents, 0))
const totalRequested = computed(() => afsgRequested.value + bfsgRequested.value)
const totalRequired = computed(() => afsgRequired.value + bfsgRequired.value)

</script>

<template>
  <tr>
    <th>{{ semester }}</th>
    <td>{{ euroCents(afsgRequested) }}</td>
    <td>{{ euroCents(afsgRequired) }}</td>
    <td>{{ euroCents(bfsgRequested) }}</td>
    <td>{{ euroCents(bfsgRequired) }}</td>
    <td>{{ euroCents(totalRequested) }}</td>
    <td>{{ euroCents(totalRequired) }}</td>
  </tr>
</template>

<style scoped>
.table td {
  text-align: right;
}
</style>