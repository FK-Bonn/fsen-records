<script setup lang="ts">
import {usePageSettingsStore} from "@/stores/pageSettings";

const settings = usePageSettingsStore();
</script>

<template>
  <h5 class="subtitle is-5">Filter und Einstellungen</h5>
  <ul>
    <li>
      <label class="checkbox">
        <input type="checkbox" v-model="settings.showOnlyWhoCurrentlyCanBePaid">
        Nur auszahlungsfähige Fachschaften anzeigen
      </label>
    </li>
    <li>
      <label class="checkbox">
        <input type="checkbox" v-model="settings.compactMode">
        Kompakte Ansicht
      </label>
    </li>
    <li>
      <label class="checkbox">
        <input type="checkbox" v-model="settings.showOnlySemestersWithPayoutRequests" :disabled="settings.compactMode">
        Nur Semester mit Anträgen anzeigen
      </label>
    </li>
    <li>
      <label class="checkbox">
        <input type="checkbox" v-model="settings.showOnlySemestersWithStar" :disabled="settings.compactMode">
        Nur Semester anzeigen, die ggf. als vollständig markiert werden können
      </label>
    </li>
    <li>
      <label class="checkbox">
        <input type="checkbox" v-model="settings.showFilenames" :disabled="settings.compactMode">
        Dateinamen anzeigen
      </label>
    </li>
    <li>
      <label class="checkbox">
        <input type="checkbox" v-model="settings.displayFsData" :disabled="settings.compactMode">
        FS-Kontaktdaten etc. anzeigen
      </label>
    </li>
    <li>
      <label class="checkbox">
        <input type="checkbox" v-model="settings.paleLowerDocuments" :disabled="settings.compactMode">
        Dokumente blass anzeigen, die ein niedrigeres Level als die Oberkategorie haben
      </label>
    </li>
  </ul>
</template>

<style scoped>
.subtitle.is-5 {
  margin-bottom: .2rem;
}
</style>