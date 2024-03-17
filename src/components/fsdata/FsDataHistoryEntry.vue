<script setup lang="ts">
import {computed, type Ref, ref} from "vue";
import {useAllFsData} from "@/stores/allFsData";
import type {IFsDataHistoryEntry} from "@/interfaces";
import {approveFsData, getFsData, putFsData} from "@/util";
import {useTokenStore} from "@/stores/token";
import TS from "@/components/TS.vue";

const show = defineModel<boolean>({required: true});
const props = defineProps<{
  data: IFsDataHistoryEntry,
  previous: IFsDataHistoryEntry | null,
  fs: string,
}>();

const token = useTokenStore();
const allFsData = useAllFsData();

const message: Ref<string | null> = ref(null);

const loadFsData = () => {
  getFsData(props.fs, token.apiToken).then(data => {
    if (allFsData.data && data) {
      allFsData.data[props.fs].data = data;
    }
  });
}

const approve = () => {
  approveFsData(props.data.id, token.apiToken).then(value => {
    message.value = value?.message || null;
    loadFsData();
  })
}

const restore = () => {
  putFsData(props.fs, props.data, token.apiToken).then(() => {
    loadFsData();
    show.value = false;
  }).catch(() => alert('Speichern fehlgeschlagen.'));
}

const emailChanged = computed(() => props.previous && props.previous.email !== props.data.email);
const phoneChanged = computed(() => props.previous && props.previous.phone !== props.data.phone);
const websiteChanged = computed(() => props.previous && props.previous.website !== props.data.website);
const addressChanged = computed(() => props.previous && props.previous.address !== props.data.address);
const serviceTimesMondayChanged = computed(() => props.previous && props.previous.serviceTimes?.monday !== props.data.serviceTimes?.monday);
const serviceTimesTuesdayChanged = computed(() => props.previous && props.previous.serviceTimes?.tuesday !== props.data.serviceTimes?.tuesday);
const serviceTimesWednesdayChanged = computed(() => props.previous && props.previous.serviceTimes?.wednesday !== props.data.serviceTimes?.wednesday);
const serviceTimesThursdayChanged = computed(() => props.previous && props.previous.serviceTimes?.thursday !== props.data.serviceTimes?.thursday);
const serviceTimesFridayChanged = computed(() => props.previous && props.previous.serviceTimes?.friday !== props.data.serviceTimes?.friday);
const regularMeetingDayOfWeekChanged = computed(() => props.previous && props.previous.regularMeeting?.dayOfWeek !== props.data.regularMeeting?.dayOfWeek);
const regularMeetingTimeChanged = computed(() => props.previous && props.previous.regularMeeting?.time !== props.data.regularMeeting?.time);
const regularMeetingLocationChanged = computed(() => props.previous && props.previous.regularMeeting?.location !== props.data.regularMeeting?.location);

</script>

<template>
  <div class="box has-background-warning-light">
    <h4>Stand von:
      <TS :ts="data.timestamp"/>
      ({{data.user}})
    </h4>
    <button class="button is-small" @click="restore">
      Wiederherstellen
    </button>

    <dl>
      <dt>E-Mail</dt>
      <dd class="{emailChanged ? 'has-background-warning':''}">
        <template v-if="!emailChanged">
          <a href="mailto:{data.email}">{{ data.email }}</a>
        </template>
        <template v-else>
          <del>{{ previous?.email }}</del>
          <br>
          <a href="mailto:{data.email}"><b>{{ data.email }}</b></a>
        </template>
      </dd>
      <dt>Telefon</dt>
      <dd class="{phoneChanged ? 'has-background-warning':''}">
        <template v-if="!phoneChanged">
          <a href="tel:{data.phone}">{{ data.phone }}</a>
        </template>
        <template v-else>
          <del>{{ previous?.phone }}</del>
          <br>
          <a href="tel:{data.phone}"><b>{{ data.phone }}</b></a>
        </template>
      </dd>
      <dt>Webseite</dt>
      <dd class="{websiteChanged ? 'has-background-warning':''}">
        <template v-if="!websiteChanged">
          <a :href="data.website">{{ data.website }}</a>
        </template>
        <template v-else>
          <del>{previous.website}</del>
          <br>
          <a :href="data.website"><b>{{ data.website }}</b></a>
        </template>
      </dd>
      <dt>Adresse</dt>
      <dd class="address {addressChanged ? 'has-background-warning':''}">
        <template v-if="!addressChanged">
          {{ data.address }}
        </template>
        <template v-else>
          <del>{{ previous?.address }}</del>
          <br>
          <b>{{ data.address }}</b>
        </template>
      </dd>
      <dt>Anwesenheitszeiten (AWD)</dt>
      <dd>
        <table class="table">
          <tbody>
          <tr class="{serviceTimesMondayChanged ? 'has-background-warning':''}">
            <td>Montag</td>
            <td>
              <template v-if="!serviceTimesMondayChanged">
                {{ data.serviceTimes?.monday }}
              </template>
              <template v-else>
                <del>{{previous?.serviceTimes?.monday}}</del>
                <br>
                <b>{{data.serviceTimes?.monday}}</b>
              </template>
            </td>
          </tr>
          <tr class="{serviceTimesTuesdayChanged ? 'has-background-warning':''}">
            <td>Dienstag</td>
            <td>
              <template v-if="!serviceTimesTuesdayChanged">
                {{ data.serviceTimes?.tuesday }}
              </template>
              <template v-else>
                <del>{{ previous?.serviceTimes?.tuesday }}</del>
                <br>
                <b>{{data.serviceTimes?.tuesday}}</b>
              </template>
            </td>
          </tr>
          <tr class="{serviceTimesWednesdayChanged ? 'has-background-warning':''}">
            <td>Mittwoch</td>
            <td>
              <template v-if="!serviceTimesWednesdayChanged">
                {{ data.serviceTimes?.wednesday }}
              </template>
              <template v-else>
                <del>{{ previous?.serviceTimes?.wednesday }}</del>
                <br>
                <b>{{ data.serviceTimes?.wednesday }}</b>
              </template>
            </td>
          </tr>
          <tr class="{serviceTimesThursdayChanged ? 'has-background-warning':''}">
            <td>Donnerstag</td>
            <td>
              <template v-if="!serviceTimesThursdayChanged">
                {{ data.serviceTimes?.thursday }}
              </template>
              <template v-else>
                <del>{{ previous?.serviceTimes?.thursday }}</del>
                <br>
                <b>{{ data.serviceTimes?.thursday }}</b>
              </template>
            </td>
          </tr>
          <tr class="{serviceTimesFridayChanged ? 'has-background-warning':''}">
            <td>Freitag</td>
            <td>
              <template v-if="!serviceTimesFridayChanged">
                {{ data.serviceTimes?.friday }}
              </template>
              <template v-else>
                <del>{{ previous?.serviceTimes?.friday }}</del>
                <br>
                <b>{{ data.serviceTimes?.friday }}</b>
              </template>
            </td>
          </tr>
          </tbody>
        </table>
      </dd>
      <dt>Regelmäßiger Sitzungstermin</dt>
      <dd>
        <dl>
          <dt>Wochentag</dt>
          <dd class="{regularMeetingDayOfWeekChanged ? 'has-background-warning':''}">
            <template v-if="!regularMeetingDayOfWeekChanged">
              {{ data.regularMeeting?.dayOfWeek }}
            </template>
            <template v-else>
              <del>{{ previous?.regularMeeting?.dayOfWeek }}</del>
              <br>
              <b>{{ data.regularMeeting?.dayOfWeek }}</b>
            </template>
          </dd>
          <dt>Uhrzeit</dt>
          <dd class="{regularMeetingTimeChanged ? 'has-background-warning':''}">
            <template v-if="!regularMeetingTimeChanged">
              {{ data.regularMeeting?.time }}
            </template>
            <template v-else>
              <del>{{ previous?.regularMeeting?.time }}</del>
              <br>
              <b>{{ data.regularMeeting?.time }}</b>
            </template>
          </dd>
          <dt>Ort</dt>
          <dd class="{regularMeetingLocationChanged ? 'has-background-warning':''}">
            <template v-if="!regularMeetingLocationChanged">
              {{ data.regularMeeting?.location }}
            </template>
            <template v-else>
              <del>{{ previous?.regularMeeting?.location }}</del>
              <br>
              <b>{{ data.regularMeeting?.location }}</b>
            </template>
          </dd>
        </dl>
      </dd>
      <dt>Bestätigt?</dt>
      <dd>
        <template v-if="data.approved">
          Bestätigt von {{ data.approved_by }}: {{ data.approval_timestamp }}
        </template>
        <template v-else>
          <template v-if="message">
            {{ message }}
          </template>
          <template v-else>
            <button class="button is-small" @click="approve">
              Bestätigen
            </button>
          </template>
        </template>
      </dd>
    </dl>
  </div>
</template>

<style scoped>

</style>