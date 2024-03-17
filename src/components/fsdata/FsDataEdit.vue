<script setup lang="ts">

import type {IFsDataResponse} from "@/interfaces";

const data = defineModel<IFsDataResponse>({required: true})

</script>

<template>
  <dl>
    <dt>E-Mail</dt>
    <dd><input class="input" v-model="data.data.email"/></dd>
    <dt>Telefon</dt>
    <dd><input class="input" v-model="data.data.phone"/></dd>
    <dt>Webseite</dt>
    <dd><input class="input" v-model="data.data.website"/></dd>
    <dt>Adresse</dt>
    <dd><textarea class="textarea" v-model="data.data.address"></textarea></dd>
    <dt>Anwesenheitszeiten (AWD)</dt>
    <dd>
      <table class="table">
        <tbody>
        <tr>
          <td>Montag</td>
          <td><input class="input" v-model="data.data.serviceTimes.monday"/></td>
        </tr>
        <tr>
          <td>Dienstag</td>
          <td><input class="input" v-model="data.data.serviceTimes.tuesday"/></td>
        </tr>
        <tr>
          <td>Mittwoch</td>
          <td><input class="input" v-model="data.data.serviceTimes.wednesday"/></td>
        </tr>
        <tr>
          <td>Donnerstag</td>
          <td><input class="input" v-model="data.data.serviceTimes.thursday"/></td>
        </tr>
        <tr>
          <td>Freitag</td>
          <td><input class="input" v-model="data.data.serviceTimes.friday"/></td>
        </tr>
        </tbody>
      </table>
    </dd>
    <dt>Regelmäßiger Sitzungstermin</dt>
    <dd>
      <dl>
        <dt>Wochentag</dt>
        <dd><input class="input" v-model="data.data.regularMeeting.dayOfWeek"/></dd>
        <dt>Uhrzeit</dt>
        <dd><input class="input" v-model="data.data.regularMeeting.time"/></dd>
        <dt>Ort</dt>
        <dd><input class="input" v-model="data.data.regularMeeting.location"/></dd>
      </dl>
    </dd>
  </dl>
</template>

<style scoped>

</style>