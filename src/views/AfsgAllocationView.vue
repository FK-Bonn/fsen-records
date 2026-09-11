<script setup lang="ts">
import {computed, onBeforeMount, type Ref, ref} from "vue";
import {euroCents, loadAllocations, putAllocation, updatePageTitle} from "@/util";
import type {IAllocation} from "@/interfaces";
import {useAccountStore} from "@/stores/account";
import {useAllFsData} from "@/stores/allFsData";
import {useTokenStore} from "@/stores/token";

const fsData = useAllFsData();
const account = useAccountStore();
const token = useTokenStore();
const allocation: Ref<null | IAllocation[]> = ref(null);
const newAllocations = ref("");
const message = ref("");

const periodFilter = ref("");
const fsFilter = ref("");

const loadAllocationData = () => {
  loadAllocations().then(value => allocation.value = value);
};

onBeforeMount(() => {
  updatePageTitle('AFSG-Zuweisung');
  loadAllocationData();
});

const filteredAllocation = computed(() => {
  return allocation.value?.filter(row => row.period.includes(periodFilter.value) && row.fs.includes(fsFilter.value));
})

const fsNameToFsId = (name: string) => {
  if (!fsData.data) {
    return '???';
  }
  for (const fsId in fsData.data) {
    if (fsData.data[fsId].base?.data.name === name) {
      return fsId;
    }
  }
  return '???';
}

const fsIdToFsName = (fsId: string) => {
  if (!fsData.data) {
    return '???';
  }
  for (const key in fsData.data) {
    if (key === fsId) {
      return fsData.data[fsId].base?.data.name || '???';
    }
  }
  return '???';
}

const parseAllocations = () => {
  const rows = newAllocations.value.split('\n');
  const parsedAllocations = [];
  for (const row of rows) {
    const items = row.split('\t').map(str => str.trim());
    if (items.length === 3) {
      const period = items[0];
      const fsName = items[1];
      const fs = fsNameToFsId(fsName);
      const amount_cents = Math.round(parseFloat(items[2].replace(/[ .€]/g, '').replace(',', '.')) * 100);
      parsedAllocations.push({"period": period, "fs": fs, "amount_cents": amount_cents});
    }
  }
  return parsedAllocations;
}

const parsedAllocations = computed(parseAllocations);


const saveAllocations = async () => {
  message.value = "Wird gespeichert…";
  for (const allocation of parsedAllocations.value) {
    await putAllocation(allocation, token.token());
  }
  loadAllocationData();
  newAllocations.value = "";
  message.value = "Speichern abgeschlossen.";
}


</script>

<template>
  <div class="container section">
    <h1 class="title is-1">AFSG-Verteilung</h1>

    <table class="table">
      <thead>
      <tr>
        <th>Zeitraum</th>
        <th>Fachschaft</th>
        <th>Betrag</th>
      </tr>
      <tr>
        <td><input class="input is-small" v-model="periodFilter"></td>
        <td><input class="input is-small" v-model="fsFilter"></td>
        <td></td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="row in filteredAllocation">
        <td>{{ row.period }}</td>
        <td>{{ fsIdToFsName(row.fs) }}</td>
        <td>{{ euroCents(row.amount_cents) }}</td>
      </tr>
      </tbody>
    </table>


    <template v-if="account.user?.admin">
      <hr>
      <h2 class="title is-2">AFSG-Zuweisungen festlegen</h2>
      <p>Tab-Separierte Werte: period→fs→amount. Beispiel: <code>2026-HHJ\tMetaphysik & Astrologie\t1.234,56 €</code>
      </p>
      <textarea class="textarea" v-model="newAllocations"></textarea>

      <p>{{ parsedAllocations.length }} Einträge</p>
      <table class="table">
        <thead>
        <tr>
          <th>Zeitraum</th>
          <th>Fachschaft</th>
          <th>Betrag</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in parsedAllocations">
          <td>{{ row.period }}</td>
          <td>{{ row.fs }}</td>
          <td>{{ euroCents(row.amount_cents) }}</td>
        </tr>
        </tbody>
      </table>

      <div class="notification is-info" v-if="message">
        {{ message }}
      </div>

      <button class="button" @click="saveAllocations">Speichern</button>
    </template>

  </div>
</template>

<style scoped>
th:nth-child(3), td:nth-child(3) {
  text-align: right;
}
</style>
