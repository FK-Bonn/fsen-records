<script setup lang="ts">

import type {IProtectedFsData} from "@/interfaces";

defineProps<{
  data: IProtectedFsData,
}>()
</script>

<template>
  <details class="box has-background-warning-light">
    <summary>Interne Daten</summary>
    <dl>
      <dt>IBAN</dt>
      <dd>{{ data.iban }}</dd>
      <dt>BIC</dt>
      <dd>{{ data.bic }}</dd>
    </dl>
    <table class="table table-sm is-bordered">
      <thead>
      <tr>
        <th>E-Mail-Adresse</th>
        <th>kontakt</th>
        <th>fsl</th>
        <th>finanzen</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="emailAddress in data.email_addresses" :key="emailAddress.address">
        <th>{{ emailAddress.address }}</th>
        <template v-for="usage in ['kontakt', 'fsl', 'finanzen']" :key="usage">
          <td>{{ emailAddress.usages.includes(usage) ? '✔️' : '' }}</td>
        </template>
      </tr>
      </tbody>
    </table>
  </details>
</template>

<style scoped>
dt {
  font-weight: bold;
}

table {
  background-color: rgba(0, 0, 0, 0);
  width: auto;
}

summary {
  font-weight: bold;
  cursor: pointer;
}

details[open] > summary:first-of-type {
  margin-bottom: 1em;
}
</style>