<script setup lang="ts">

import type {IElectionData} from "@/interfaces";
import {ref} from "vue";
import ElectionEditor from "@/components/elections/ElectionEditor.vue";
import {saveElection} from "@/util";
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import ElectionHistoryModal from "@/components/elections/ElectionHistoryModal.vue";
import ElectionDisplay from "@/components/elections/ElectionDisplay.vue";

const props = defineProps<{
  election: IElectionData,
}>()

const emit = defineEmits<{
  reloadElectionList: []
}>()

const token = useTokenStore();
const account = useAccountStore();

const electionCopy = ref(JSON.parse(JSON.stringify(props.election)))
const edit = ref(false);
const historyModal = ref(false);
const toggleEdit = () => {
  electionCopy.value = JSON.parse(JSON.stringify(props.election))
  edit.value = !edit.value;
}
const showHistory = () => {
  historyModal.value = true;
}
const save = () => {
  saveElection(electionCopy.value, token.token()).then(() => {
    toggleEdit();
    emit('reloadElectionList');
  })
}
</script>

<template>
  <div class="box" v-if="edit">
    <ElectionEditor v-model="electionCopy"/>
    <button class="button is-small" @click="toggleEdit">Abbrechen</button>
    <button class="button is-small is-primary" @click="save">Speichern</button>
  </div>
  <div class="box" v-else>
    <ElectionDisplay :election="election"/>
    <template v-if="account.user?.admin">
      <button class="button is-small" @click="toggleEdit">Bearbeiten</button>
      <button class="button is-small" @click="showHistory">Bearbeitungsverlauf</button>
    </template>
  </div>
  <ElectionHistoryModal v-if="historyModal" :electionId="election.election_id"
                        v-model="historyModal"/>
</template>

<style scoped>
</style>