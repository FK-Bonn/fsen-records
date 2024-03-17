<script setup lang="ts">

import type {IFsData} from "@/interfaces";

defineProps<{
  data: IFsData,
}>()
</script>

<template>
  <dl>
    <dt>E-Mail</dt>
    <dd><a :href="'mailto:'+data.email">{{ data.email }}</a></dd>
    <dt>Telefon</dt>
    <dd><a :href="'tel:'+data.phone">{{ data.phone }}</a></dd>
    <dt>Webseite</dt>
    <dd><a :href="data.website">{{ data.website }}</a></dd>
    <dt>Adresse</dt>
    <dd class="address">{{ data.address }}</dd>
    <dt>Anwesenheitszeiten (AWD)</dt>
    <dd>
      <table class="table">
        <tbody>
        <tr>
          <td>Montag</td>
          <td>{{ data.serviceTimes?.monday }}</td>
        </tr>
        <tr>
          <td>Dienstag</td>
          <td>{{ data.serviceTimes?.tuesday }}</td>
        </tr>
        <tr>
          <td>Mittwoch</td>
          <td>{{ data.serviceTimes?.wednesday }}</td>
        </tr>
        <tr>
          <td>Donnerstag</td>
          <td>{{ data.serviceTimes?.thursday }}</td>
        </tr>
        <tr>
          <td>Freitag</td>
          <td>{{ data.serviceTimes?.friday }}</td>
        </tr>
        </tbody>
      </table>
    </dd>
    <dt>Regelmäßiger Sitzungstermin</dt>
    <dd>
      <dl>
        <dt>Wochentag</dt>
        <dd>{{ data.regularMeeting?.dayOfWeek }}</dd>
        <dt>Uhrzeit</dt>
        <dd>{{ data.regularMeeting?.time }}</dd>
        <dt>Ort</dt>
        <dd>{{ data.regularMeeting?.location }}</dd>
      </dl>
    </dd>
  </dl>
</template>

<style scoped>
dt {
  font-weight: bold;
}

dd.address {
  white-space: pre;
}

table {
  background-color: rgba(0, 0, 0, 0);
  width: auto;
}
</style>