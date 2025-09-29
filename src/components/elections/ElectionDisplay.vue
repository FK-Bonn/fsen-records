<script setup lang="ts">

import type {IElectionData} from "@/interfaces";
import {computed} from "vue";
import {useAllFsData} from "@/stores/allFsData";

const props = defineProps<{
  election: IElectionData,
}>()

const fsData = useAllFsData();

const fsName = computed(() => fsData.data ? fsData.data[props.election.fs]?.base?.data.name || props.election.fs : props.election.fs)
const cutoffDate = computed(() => {
      if (!props.election.first_election_day) {
        return '???';
      }
      const base = new Date(props.election.first_election_day);
      base.setUTCDate(base.getUTCDate() - 30);
      return base.toISOString().substring(0, 10);
    }
)
const smh = computed(() => (props.election.electoral_register_request_date
    && cutoffDate.value !== '???'
    && (props.election.electoral_register_request_date > cutoffDate.value)) ? ' 🤦' : '');
</script>

<template>
  <div class="columns">
    <div class="column">
      <h4 class="subtitle is-4">
        <b>{{ election.committee || '???' }}</b>-Wahl {{ fsName }}
      </h4>
      <h3 class="title is-3">{{ election.first_election_day }}
        <span v-if="election.first_election_day !== election.last_election_day"> bis {{
            election.last_election_day
          }}</span>
      </h3>
    </div>
    <div class="column">
      <p class="has-text-right">{{ election.election_method }}</p>
    </div>
  </div>

  <div class="columns has-text-centered">
    <div class="column">
      <p class="is-size-4">{{ cutoffDate }}</p>
      Stichtag Wählendenverzeichnis
    </div>
    <div class="column">
      <p class="is-size-4">{{ election.electoral_register_request_date || '???' }}{{ smh }}</p>
      Wählendenverzeichnis beantragt
    </div>
    <div class="column">
      <p class="is-size-4">{{ election.electoral_register_hand_out_date || '???' }}</p>
      Wählendenverzeichnis ausgegeben
    </div>
  </div>
  <div class="columns">
    <div class="column">
      <p v-if="election.result_url">
        Wahlergebnis <a :href="election.result_url">veröffentlicht</a> am {{
          election.result_published_date || '???'
        }}
      </p>
      <p v-else>
        Wahlergebnis wurde noch nicht veröffentlicht
      </p>
    </div>
    <div class="column">
      Wahlprüfung: <b>{{ election.scrutiny_status || '–' }}</b>
    </div>
    <div class="column">
      <p>Kommentare: <i>{{ election.comments || '–' }}</i></p>
    </div>
  </div>
</template>

<style scoped>
.column {
  padding-top: .2rem;
  padding-bottom: .2rem;
}
</style>