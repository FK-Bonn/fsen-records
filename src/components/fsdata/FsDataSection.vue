<script setup lang="ts">
import {computed, ref} from "vue";
import {useAllFsData} from "@/stores/allFsData";
import type {IFsData, IProtectedFsData, IStudentBody} from "@/interfaces";
import {useAccountStore} from "@/stores/account";
import {getFsData, getProtectedFsData, hasFsPermission, putFsData, putProtectedFsData} from "@/util";
import {useTokenStore} from "@/stores/token";
import FsDataEdit from "@/components/fsdata/FsDataEdit.vue";
import FsDataDisplay from "@/components/fsdata/FsDataDisplay.vue";
import ProtectedFsDataDisplay from "@/components/fsdata/ProtectedFsDataDisplay.vue";
import ProtectedFsDataEdit from "@/components/fsdata/ProtectedFsDataEdit.vue";
import FsDataHistoryModal from "@/components/fsdata/FsDataHistoryModal.vue";
import FsProtectedDataHistoryModal from "@/components/fsdata/FsProtectedDataHistoryModal.vue";

const props = defineProps<{
  studentBody: IStudentBody,
}>()
const allFsData = useAllFsData();
const token = useTokenStore();
const account = useAccountStore();


const editFsData = ref(false);
const editProtectedFsData = ref(false);
const showFsDataHistoryModal = ref(false);
const showFsProtectedDataHistoryModal = ref(false);

const data = computed(() => allFsData.data?.hasOwnProperty(props.studentBody.id) ? allFsData.data && allFsData.data[props.studentBody.id].data : null);
const protectedData = computed(() => allFsData.data?.hasOwnProperty(props.studentBody.id) ? allFsData.data && allFsData.data[props.studentBody.id].protected_data : null);

const saveFsData = (data: IFsData) => {
  putFsData(props.studentBody.id, data, token.apiToken).then(() => reloadFsData())
      .catch(() => alert('Speichern fehlgeschlagen.'));
}

const saveProtectedFsData = (data: IProtectedFsData) => {
  putProtectedFsData(props.studentBody.id, data, token.apiToken).then(() => reloadProtectedFsData())
      .catch(() => alert('Speichern fehlgeschlagen.'));
}

const reloadFsData = () => {
  editFsData.value = false;
  loadFsData();
}

const reloadProtectedFsData = () => {
  editProtectedFsData.value = false;
  loadProtectedFsData();
}

const makeFsDataEditable = () => {
  editFsData.value = true;
}

const makeProtectedFsDataEditable = () => {
  editProtectedFsData.value = !editProtectedFsData.value;
}

const loadFsData = () => {
  getFsData(props.studentBody.id, token.apiToken).then(data => {
    if (allFsData.data && data) {
      allFsData.data[props.studentBody.id].data = data;
    }
  });
}
const loadProtectedFsData = () => {
  getProtectedFsData(props.studentBody.id, token.apiToken).then(data => {
    if (allFsData.data && data) {
      allFsData.data[props.studentBody.id].protected_data = data;
    }
  });
}

const displayFsDataHistory = () => {
  showFsDataHistoryModal.value = true;
  showFsProtectedDataHistoryModal.value = false;
}
const displayProtectedFsDataHistory = () => {
  showFsDataHistoryModal.value = false;
  showFsProtectedDataHistoryModal.value = true;
}
</script>

<template>
  <div class="fs-data content">
    <template v-if="data">
      <article v-if="!data?.is_latest" class="message is-danger">
        <div class="message-header"><p>Neuere Daten vorhanden</p></div>
        <div class="message-body">
          <p>
            Diese Daten sind veraltet.
            Es sind neuere Daten vorhanden, die allerdings noch nicht überprüft wurden
            und deshalb nicht angezeigt werden.</p>
        </div>
      </article>
      <template v-if="editFsData">
        <button @click="()=>{if(data){saveFsData(data.data)}}" class="button is-small is-bordered is-pulled-right">
          Speichern
        </button>
        <button @click="()=>reloadFsData()" class="button is-small is-bordered is-pulled-right">
          Abbrechen
        </button>
        <FsDataEdit v-model="data"/>
      </template>
      <template v-else>
        <template v-if="account.user?.admin">
          <button @click="()=>displayFsDataHistory()" class="button is-small is-bordered is-pulled-right">
            Bearbeitungsverlauf
          </button>
        </template>
        <template
            v-if="account.user && hasFsPermission(account.user.permissions, studentBody.id, 'write_public_data') || account.user?.admin">
          <button @click="()=>makeFsDataEditable()" class="button is-small is-bordered is-pulled-right">
            Bearbeiten
          </button>
        </template>
        <FsDataDisplay :data="data.data"/>
      </template>
    </template>
    <template v-if="protectedData">
      <article v-if="!protectedData.is_latest" class="message is-danger">
        <div class="message-header"><p>Neuere interne Daten vorhanden</p></div>
        <div class="message-body">
          <p>
            Diese internen Daten sind veraltet.
            Es sind neuere interne Daten vorhanden, die allerdings noch nicht überprüft wurden
            und deshalb nicht angezeigt werden.</p>
        </div>
      </article>
      <template v-if="editProtectedFsData">
        <button @click="()=>protectedData && saveProtectedFsData(protectedData.data)"
                class="button is-small is-bordered is-pulled-right">
          Speichern
        </button>
        <button @click="()=>reloadProtectedFsData()" class="button is-small is-bordered is-pulled-right">
          Abbrechen
        </button>
        <ProtectedFsDataEdit v-model="protectedData"/>
      </template>
      <template v-else>
        <template v-if="account.user?.admin">
          <button @click="()=>displayProtectedFsDataHistory()"
                  class="button is-small is-bordered is-pulled-right">
            Bearbeitungsverlauf
          </button>
        </template>
        <button @click="()=>makeProtectedFsDataEditable()"
                class="button is-small is-bordered is-pulled-right">
          Bearbeiten
        </button>
        <ProtectedFsDataDisplay :data="protectedData.data"/>
      </template>
    </template>
  </div>
  <FsDataHistoryModal v-if="showFsDataHistoryModal" :fs="studentBody.id" v-model="showFsDataHistoryModal"/>
  <FsProtectedDataHistoryModal v-if="showFsProtectedDataHistoryModal" :fs="studentBody.id"
                               v-model="showFsProtectedDataHistoryModal"/>
</template>

<style scoped>
.fs-data {
  margin-top: 1em;
}
</style>