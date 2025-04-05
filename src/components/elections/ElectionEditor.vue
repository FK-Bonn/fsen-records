<script setup lang="ts">
import type {IElectionData} from "@/interfaces";
import {useAllFsData} from "@/stores/allFsData";

const data = defineModel<IElectionData>({required: true})
const fsData = useAllFsData();

</script>

<template>
  <dl v-if="fsData">
    <dt>ID</dt>
    <dd><input class="input" v-model="data.election_id" disabled/></dd>
    <dt>Fachschaft</dt>
    <dd>
      <div class="select">
        <select v-model="data.fs">
          <option v-for="(value, key) in fsData.data" :value="key" :key="key">{{ value.base?.data.name || key }}
          </option>
        </select>
      </div>
    </dd>
    <dt>Zu wählendes Gremium</dt>
    <dd>
      <div class="select">
        <select v-model="data.committee">
          <option value="FSV">FSV</option>
          <option value="FSR">FSR</option>
        </select>
      </div>
    </dd>
    <dt>Wahlverfahren</dt>
    <dd>
      <div class="select">
        <select v-model="data.election_method">
          <option value="Urnenwahl">Urnenwahl</option>
          <option value="Wahlvollversammlung">Wahlvollversammlung</option>
        </select>
      </div>
    </dd>
    <dt>Erster Wahltag</dt>
    <dd><input class="input" type="date" v-model="data.first_election_day"/></dd>
    <dt>Letzter Wahltag</dt>
    <dd><input class="input" type="date" v-model="data.last_election_day"/></dd>
    <dt>Antragsdatum Wählendenverzeichnis</dt>
    <dd><input class="input" type="date" v-model="data.electoral_register_request_date"/></dd>
    <dt>Ausgabedatum Wählendenverzeichnis</dt>
    <dd><input class="input" type="date" v-model="data.electoral_register_hand_out_date"/></dd>
    <dt>URL Wahlergebnis (Bekanntmachungen der Studierendenschaft)</dt>
    <dd><input class="input" v-model="data.result_url"/></dd>
    <dt>Datum der Ergebnisveröffentlichung</dt>
    <dd><input class="input" type="date" v-model="data.result_published_date"/></dd>
    <dt>Status der Wahlprüfung</dt>
    <dd><input class="input" v-model="data.scrutiny_status"/></dd>
    <dt>Kommentare</dt>
    <dd><input class="input" v-model="data.comments"/></dd>
  </dl>
</template>

<style scoped>

</style>