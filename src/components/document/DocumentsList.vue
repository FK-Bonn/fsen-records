<script setup lang="ts">

import type {IStudentBody} from "@/interfaces";
import SingleDocument from "@/components/document/SingleDocument.vue";

defineProps<{
  studentBody: IStudentBody,
}>()
</script>

<template>
  <div class="card-content">
    <div class="content">
      <h3 class="heading is-3">Haushaltspläne</h3>
      <template v-if="studentBody.budgets.length > 0">
        <ul>
          <li v-for="budget in studentBody.budgets" :key="budget.filename">
            <SingleDocument :document="budget" :studentBody="studentBody"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>
      <h3 class="heading is-3">Haushaltsrechnungen</h3>
      <template v-if="studentBody.balances.length > 0">
        <ul>
          <li v-for="balance in studentBody.balances" :key="balance.filename">
            <SingleDocument :document="balance" :studentBody="studentBody"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>
      <h3 class="heading is-3">Kassenprüfungen</h3>
      <template v-if="studentBody.cashAudits.length > 0">
        <ul>
          <li v-for="cashAudit in studentBody.cashAudits" :key="cashAudit.filename">
            <SingleDocument :document="cashAudit" :studentBody="studentBody"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>
      <h3 class="heading is-3">Protokolle</h3>
      <template v-if="studentBody.proceedings.length > 0">
        <ul>
          <li v-for="proceeding in studentBody.proceedings" :key="proceeding.filename">
            <SingleDocument :document="proceeding" :studentBody="studentBody"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>
      <h3 class="heading is-3">Wahlergebnisse</h3>
      <template v-if="studentBody.electionResults.length > 0">
        <ul>
          <li v-for="electionResult in studentBody.electionResults" :key="electionResult.filename">
            <SingleDocument :document="electionResult" :studentBody="studentBody"/>
          </li>
        </ul>
      </template>
      <template v-else>
        Keine vorhanden.
      </template>
    </div>
  </div>
</template>

<style scoped>
li {
  list-style: none;
}
</style>