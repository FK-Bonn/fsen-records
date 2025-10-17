<script setup lang="ts">
import {onBeforeMount, ref, type Ref} from "vue";
import {loadProceedingsIndex, loadSGliedSData, updatePageTitle} from "@/util";
import type {IProceedings, ISGliedSStatusData} from "@/interfaces";

const data: Ref<null | ISGliedSStatusData> = ref(null);

const loadData = () => {
  loadSGliedSData().then(value => data.value = value);
};

onBeforeMount(() => {
  updatePageTitle('Studierendenschaftsgliederungssatzung');
  loadData();
});
</script>

<template>
  <div class="section" v-if="data">
    <div class="content">

      <h1 class="title is-1">Studierenden&shy;schafts&shy;gliederungs&shy;satzung</h1>

      <p>Letzte Aktualisierung: {{ data.last_run }}</p>

      <h2 class="title is-2">
        Einträge der Studierenden&shy;schafts&shy;gliederungs&shy;satzung ohne zugehörige CRM-Zuordnung
      </h2>

      <template v-if="data.in_sglieds_but_not_in_crm.length > 0">
        <table class="table is-narrow">
          <thead>
          <tr>
            <th>Nr.</th>
            <th>Fachschaft</th>
            <th>Fach</th>
            <th>Abschluss</th>
            <th>M</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in data.in_sglieds_but_not_in_crm" :key="item.sglieds.nr">
            <td>{{ item.sglieds.nr }}</td>
            <td>{{ item.sglieds.fs }}</td>
            <td>{{ item.sglieds.subject }}</td>
            <td>{{ item.sglieds.degree }}</td>
            <td>{{ item.sglieds.m }}</td>
          </tr>
          </tbody>
        </table>
      </template>
      <p v-else>Keine 😄</p>

      <h2 class="title is-2">
        CRM-Zuordnungen ohne Eintrag in der Studierenden&shy;schafts&shy;gliederungs&shy;satzung
      </h2>


      <template v-if="data.wrong_crm_assignments.length > 0">
        <table class="table is-narrow">
          <thead>
          <tr>
            <th>Fachschaft-ID</th>
            <th>Fach</th>
            <th>Fach-ID</th>
            <th>Abschluss</th>
            <th>Abschluss-ID</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in data.wrong_crm_assignments" :key="JSON.stringify(item)">
            <td>{{ item.fs_id }}</td>
            <td>{{ item.subject }}</td>
            <td>{{ item.subject_id }}</td>
            <td>{{ item.degree }}</td>
            <td>{{ item.degree_id }}</td>
          </tr>
          </tbody>
        </table>
      </template>
      <p v-else>Keine 😄</p>

      <h2 class="title is-2">
        Durchzuführende CRM-Zuordnungen
      </h2>

      <template v-if="data.needs_assignment_in_crm.length > 0">
        <table class="table is-narrow">
          <thead>
          <tr>
            <th>Fachschaft</th>
            <th></th>
            <th>Fach</th>
            <th>Fach-ID</th>
            <th>Abschluss</th>
            <th>Abschluss-ID</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in data.needs_assignment_in_crm">
            <td>{{ item.fs }}</td>
            <td>←</td>
            <td>{{ item.unassigned.subject }}</td>
            <td>{{ item.unassigned.subject_id }}</td>
            <td>{{ item.unassigned.degree }}</td>
            <td>{{ item.unassigned.degree_id }}</td>
          </tr>
          </tbody>
        </table>
      </template>
      <p v-else>Keine 😄</p>


      <h2 class="title is-2">
        FAKs, die in der Studierenden&shy;schafts&shy;gliederungs&shy;satzung zugeordnet werden müssen
      </h2>


      <template v-if="data.needs_assignment_in_sglieds.length > 0">
        <div class="notification is-danger">
          Wenn etwas seltsam aussieht, vor der Zuordnung bei der Universitätsverwaltung nachfragen!
        </div>

        <table class="table is-narrow">
          <thead>
          <tr>
            <th>Fach</th>
            <th>Fach-ID</th>
            <th>Abschluss</th>
            <th>Abschluss-ID</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in data.needs_assignment_in_sglieds">
            <td>{{ item.subject }}</td>
            <td>{{ item.subject_id }}</td>
            <td>{{ item.degree }}</td>
            <td>{{ item.degree_id }}</td>
          </tr>
          </tbody>
        </table>
      </template>
      <p v-else>Keine 😄</p>


      <h2 class="title is-2">
        Einträge der Studierenden&shy;schafts&shy;gliederungs&shy;satzung mit zugehörigen CRM-Zuordnungen
      </h2>


      <table class="table is-narrow is-striped">
        <thead>
        <tr>
          <th>Nr.</th>
          <th>Fachschaft</th>
          <th>Fach</th>
          <th>Abschluss</th>
          <th>M</th>
        </tr>
        </thead>
        <tbody>
        <template v-for="item in data.sglieds_with_crm_assignments">
          <tr>
            <td>{{ item.sglieds.nr }}</td>
            <td>{{ item.sglieds.fs }}</td>
            <td>{{ item.sglieds.subject }}</td>
            <td>{{ item.sglieds.degree }}</td>
            <td>{{ item.sglieds.m }}</td>
          </tr>
          <tr>
            <td></td>
            <td colspan="4">
              <table class="table is-narrow is-bordered">
                <thead>
                <tr>
                  <th>Fachschaft-ID</th>
                  <th>Fach</th>
                  <th>Fach-ID</th>
                  <th>Abschluss</th>
                  <th>Abschluss-ID</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="crm in item.crm">
                  <td>{{ crm.fs_id }}</td>
                  <td>{{ crm.subject }}</td>
                  <td>{{ crm.subject_id }}</td>
                  <td>{{ crm.degree }}</td>
                  <td>{{ crm.degree_id }}</td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </template>
        </tbody>
      </table>

    </div>
  </div>
  <p v-else>Daten werden geladen…</p>
</template>
