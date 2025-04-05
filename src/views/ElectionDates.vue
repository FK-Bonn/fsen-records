<script setup lang="ts">
import {computed, onBeforeMount, type Ref, ref} from "vue";
import {loadElectionDatesIndex, saveElection, updatePageTitle} from "@/util";
import type {IElectionData} from "@/interfaces";
import ElectionDisplay from "@/components/elections/ElectionDisplay.vue";
import {useAccountStore} from "@/stores/account";
import ElectionEditor from "@/components/elections/ElectionEditor.vue";
import {useTokenStore} from "@/stores/token";
import ElectionContainer from "@/components/elections/ElectionContainer.vue";

const index: Ref<null | IElectionData[]> = ref(null);

const token = useTokenStore();
const account = useAccountStore();
const newElection: Ref<IElectionData | null> = ref(null);

const loadIndex = () => {
  loadElectionDatesIndex().then(value => index.value = value);
};
onBeforeMount(() => {
  updatePageTitle('Wahltermine');
  loadIndex();
});
const TODAY = new Date().toISOString().substring(0, 10);
const upcomingElections = computed(() => index.value?.filter(election => election.first_election_day > TODAY) || [])
const currentElections = computed(() => index.value?.filter(election => election.first_election_day <= TODAY && election.last_election_day >= TODAY) || [])
const pastElections = computed(() => index.value?.filter(election => election.last_election_day < TODAY) || [])

const createNewElection = () => {
  newElection.value = {
    election_id: self.crypto.randomUUID(),
    fs: '',
    committee: '',
    election_method: '',
    first_election_day: '',
    last_election_day: '',
    electoral_register_request_date: '',
    electoral_register_hand_out_date: '',
    result_url: '',
    result_published_date: '',
    scrutiny_status: '',
    comments: '',
  };
}

const resetNewElection = () => {
  newElection.value = null;
}


const save = () => {
  saveElection(newElection.value, token.apiToken).then(() => {
    resetNewElection();
    loadIndex();
  })
}

</script>

<template>
  <div class="container section">
    <h1 class="title is-1">Wahltermine</h1>

    <button v-if="account.user?.admin" class="button is-small is-primary mb-5" @click="createNewElection">Neue Wahl erstellen</button>
    <template v-if="newElection">
      <div class="box">
        <ElectionEditor v-model="newElection"/>
        <button class="button is-small" @click="resetNewElection">Abbrechen</button>
        <button class="button is-small is-primary" @click="save">Speichern</button>
      </div>
    </template>

    <h2 class="title is-2">Zukünftige Wahlen</h2>
    <ul v-if="upcomingElections.length > 0">
      <li v-for="item in upcomingElections" :key="item.election_id">
        <ElectionContainer :election="item" @reload-election-list="loadIndex()"/>
      </li>
    </ul>
    <p v-else><i>Keine zukünftigen Wahlen</i></p>

    <hr>

    <h2 class="title is-2">Laufende Wahlen</h2>
    <ul v-if="currentElections.length > 0">
      <li v-for="item in currentElections" :key="item.election_id">
        <ElectionContainer :election="item" @reload-election-list="loadIndex()"/>
      </li>
    </ul>
    <p v-else><i>Keine laufenden Wahlen</i></p>

    <hr>

    <h2 class="title is-2">Vergangene Wahlen</h2>
    <ul v-if="pastElections.length > 0">
      <li v-for="item in pastElections" :key="item.election_id">
        <ElectionContainer :election="item" @reload-election-list="loadIndex()"/>
      </li>
    </ul>
    <p v-else><i>Keine vergangenen Wahlen</i></p>

  </div>
</template>
