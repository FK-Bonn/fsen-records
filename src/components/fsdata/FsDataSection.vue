<script setup lang="ts">
import {computed, type ComputedRef, ref} from "vue";
import {useAllFsData} from "@/stores/allFsData";
import type {
  IBaseFsData,
  IProtectedFsData,
  IProtectedFsDataResponse,
  IPublicFsData,
  IPublicFsDataResponse
} from "@/interfaces";
import {useAccountStore} from "@/stores/account";
import {
  getBaseFsData,
  getProtectedFsData,
  getPublicFsData,
  hasFsPermission,
  putBaseFsData,
  putProtectedFsData,
  putPublicFsData
} from "@/util";
import {useTokenStore} from "@/stores/token";
import PublicFsDataEdit from "@/components/fsdata/PublicFsDataEdit.vue";
import PublicFsDataDisplay from "@/components/fsdata/PublicFsDataDisplay.vue";
import ProtectedFsDataDisplay from "@/components/fsdata/ProtectedFsDataDisplay.vue";
import ProtectedFsDataEdit from "@/components/fsdata/ProtectedFsDataEdit.vue";
import PublicFsDataHistoryModal from "@/components/fsdata/PublicFsDataHistoryModal.vue";
import ProtectedFsDataHistoryModal from "@/components/fsdata/ProtectedFsDataHistoryModal.vue";
import {usePageSettingsStore} from "@/stores/pageSettings";
import BaseFsDataDisplay from "@/components/fsdata/BaseFsDataDisplay.vue";
import BaseFsDataEdit from "@/components/fsdata/BaseFsDataEdit.vue";
import BaseFsDataHistoryModal from "@/components/fsdata/BaseFsDataHistoryModal.vue";

const props = defineProps<{
  baseData: IBaseFsData,
}>()
const allFsData = useAllFsData();
const token = useTokenStore();
const account = useAccountStore();
const settings = usePageSettingsStore();

const baseDataCopy = ref(props.baseData);


const editBaseFsData = ref(false);
const editPublicFsData = ref(false);
const editProtectedFsData = ref(false);
const showBaseFsDataHistoryModal = ref(false);
const showPublicFsDataHistoryModal = ref(false);
const showProtectedFsDataHistoryModal = ref(false);

const publicData: ComputedRef<null | IPublicFsDataResponse> = computed(() => (allFsData.data && Object.prototype.hasOwnProperty.call(allFsData.data, props.baseData.fs_id)) ? allFsData.data[props.baseData.fs_id].public : null);
const protectedData: ComputedRef<null | IProtectedFsDataResponse> = computed(() => (allFsData.data && Object.prototype.hasOwnProperty.call(allFsData.data, props.baseData.fs_id)) ? allFsData.data[props.baseData.fs_id].protected : null);


const saveBaseFsData = (data: IBaseFsData) => {
  putBaseFsData(props.baseData.fs_id, data, token.apiToken).then(() => reloadBaseFsData())
      .catch(() => alert('Speichern fehlgeschlagen.'));
}

const savePublicFsData = (data: IPublicFsData) => {
  putPublicFsData(props.baseData.fs_id, data, token.apiToken).then(() => reloadPublicFsData())
      .catch(() => alert('Speichern fehlgeschlagen.'));
}

const saveProtectedFsData = (data: IProtectedFsData) => {
  putProtectedFsData(props.baseData.fs_id, data, token.apiToken).then(() => reloadProtectedFsData())
      .catch(() => alert('Speichern fehlgeschlagen.'));
}

const reloadBaseFsData = () => {
  editBaseFsData.value = false;
  loadBaseFsData();
}
const reloadPublicFsData = () => {
  editPublicFsData.value = false;
  loadPublicFsData();
}

const reloadProtectedFsData = () => {
  editProtectedFsData.value = false;
  loadProtectedFsData();
}

const makeBaseFsDataEditable = () => {
  editBaseFsData.value = true;
}

const makePublicFsDataEditable = () => {
  editPublicFsData.value = true;
}

const makeProtectedFsDataEditable = () => {
  editProtectedFsData.value = !editProtectedFsData.value;
}

const loadBaseFsData = () => {
  getBaseFsData(props.baseData.fs_id, token.apiToken).then(data => {
    if (allFsData.data && data) {
      allFsData.data[props.baseData.fs_id].base = data;
    }
  });
}

const loadPublicFsData = () => {
  getPublicFsData(props.baseData.fs_id, token.apiToken).then(data => {
    if (allFsData.data && data) {
      allFsData.data[props.baseData.fs_id].public = data;
    }
  });
}

const loadProtectedFsData = () => {
  getProtectedFsData(props.baseData.fs_id, token.apiToken).then(data => {
    if (allFsData.data && data) {
      allFsData.data[props.baseData.fs_id].protected = data;
    }
  });
}

const displayBaseFsDataHistory = () => {
  showBaseFsDataHistoryModal.value = true;
  showPublicFsDataHistoryModal.value = false;
  showProtectedFsDataHistoryModal.value = false;
}

const displayPublicFsDataHistory = () => {
  showBaseFsDataHistoryModal.value = false;
  showPublicFsDataHistoryModal.value = true;
  showProtectedFsDataHistoryModal.value = false;
}

const displayProtectedFsDataHistory = () => {
  showBaseFsDataHistoryModal.value = false;
  showPublicFsDataHistoryModal.value = false;
  showProtectedFsDataHistoryModal.value = true;
}
</script>

<template>
  <div class="fs-data content">
    <template v-if="baseData">
      <template v-if="editBaseFsData">
        <button @click="()=>{if(baseData){saveBaseFsData(baseDataCopy)}}"
                class="button is-small is-bordered is-pulled-right">
          Speichern
        </button>
        <button @click="()=>reloadBaseFsData()" class="button is-small is-bordered is-pulled-right">
          Abbrechen
        </button>
        <BaseFsDataEdit v-model="baseDataCopy"/>
      </template>
      <template v-else>
        <template v-if="account.user?.admin">
          <button @click="()=>displayBaseFsDataHistory()" class="button is-small is-bordered is-pulled-right">
            Bearbeitungsverlauf
          </button>
        </template>
        <template
            v-if="account.user?.admin">
          <button @click="()=>makeBaseFsDataEditable()" class="button is-small is-bordered is-pulled-right">
            Bearbeiten
          </button>
        </template>
        <BaseFsDataDisplay :data="baseData"/>
      </template>
    </template>

    <template v-if="publicData && settings.displayFsData">
      <hr>
      <article v-if="!publicData?.is_latest" class="message is-danger">
        <div class="message-header"><p>Neuere Daten vorhanden</p></div>
        <div class="message-body">
          <p>
            Diese Daten sind veraltet.
            Es sind neuere Daten vorhanden, die allerdings noch nicht überprüft wurden
            und deshalb nicht angezeigt werden.</p>
        </div>
      </article>
      <template v-if="editPublicFsData">
        <button @click="()=>{if(publicData){savePublicFsData(publicData.data)}}" class="button is-small is-bordered is-pulled-right">
          Speichern
        </button>
        <button @click="()=>reloadPublicFsData()" class="button is-small is-bordered is-pulled-right">
          Abbrechen
        </button>
        <PublicFsDataEdit v-model="publicData"/>
      </template>
      <template v-else>
        <template v-if="account.user?.admin">
          <button @click="()=>displayPublicFsDataHistory()" class="button is-small is-bordered is-pulled-right">
            Bearbeitungsverlauf
          </button>
        </template>
        <template
            v-if="account.user && hasFsPermission(account.user.permissions, baseData.fs_id, 'write_public_data') || account.user?.admin">
          <button @click="()=>makePublicFsDataEditable()" class="button is-small is-bordered is-pulled-right">
            Bearbeiten
          </button>
        </template>
        <PublicFsDataDisplay :data="publicData.data"/>
      </template>
    </template>

    <template v-if="protectedData && settings.displayFsData">
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
  <BaseFsDataHistoryModal v-if="showBaseFsDataHistoryModal" :fs="baseData.fs_id"
                            v-model="showBaseFsDataHistoryModal"/>
  <PublicFsDataHistoryModal v-if="showPublicFsDataHistoryModal" :fs="baseData.fs_id"
                            v-model="showPublicFsDataHistoryModal"/>
  <ProtectedFsDataHistoryModal v-if="showProtectedFsDataHistoryModal" :fs="baseData.fs_id"
                               v-model="showProtectedFsDataHistoryModal"/>
</template>

<style scoped>
ul {
  list-style-type: square;
  margin-left: 2rem;
}
</style>