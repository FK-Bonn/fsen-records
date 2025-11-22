<script setup lang="ts">
import type {IBaseFsData} from "@/interfaces";
import {computed, ref} from "vue";
import AngleIndicator from "@/components/icons/AngleIndicator.vue";
import {useAccountStore} from "@/stores/account";
import PayoutRequestsTable from "@/components/payoutrequest/PayoutRequestsTable.vue";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import BfsgRequestModal from "@/components/payoutrequest/BfsgRequestModal.vue";
import VorankuendigungRequestModal from "@/components/payoutrequest/VorankuendigungRequestModal.vue";
import {hasFsPermission} from "@/util";

const props = defineProps<{
  baseData: IBaseFsData,
}>()

const account = useAccountStore();
const payoutRequests = usePayoutRequestStore();

const opened = ref(false);
const bfsgModal = ref(false);
const vorankuendigungModal = ref(false);

const showBfsgModal = () => {
  bfsgModal.value = true;
  vorankuendigungModal.value = false;
}

const showVorankuendigungModal = () => {
  bfsgModal.value = false;
  vorankuendigungModal.value = true;
}

const toggle = () => {
  opened.value = !opened.value;
}

const vorankuendigungPayoutRequests = computed(() => payoutRequests.vorankuendigung?.get(props.baseData.fs_id))
const bfsgPayoutRequests = computed(() => payoutRequests.bfsg?.get(props.baseData.fs_id))
const isRequestAllowed = computed(() => (account.user?.admin || hasFsPermission(account.user?.permissions, props.baseData.fs_id, 'submit_payout_request')));
</script>

<template>
  <div class="card">
    <header class="card-header" @click="toggle">
      <p class="card-header-title">
        BFSG
      </p>
      <button class="card-header-icon" aria-label="more options">
        <AngleIndicator :opened="opened"/>
      </button>
    </header>
    <div v-if="opened" class="card-content">
      <div class="content">
        <h3 class="heading is-3">Vorankündigungen</h3>
        <button v-if="isRequestAllowed" class="button is-small" @click.stop="showVorankuendigungModal">
          Antrag stellen
        </button>
        <PayoutRequestsTable v-if="vorankuendigungPayoutRequests" :singleFS="true"
                             :bfsgPayoutRequests="vorankuendigungPayoutRequests"
                             type="vorankuendigung"/>
        <p v-else class="has-text-grey-dark">Keine vorhanden.</p>

        <h3 class="heading is-3">BFSG-Anträge</h3>
        <button v-if="isRequestAllowed" class="button is-small" @click.stop="showBfsgModal">
          Antrag stellen
        </button>
        <PayoutRequestsTable v-if="bfsgPayoutRequests" :singleFS="true" :bfsgPayoutRequests="bfsgPayoutRequests"
                             type="bfsg"/>
        <p v-else class="has-text-grey-dark">Keine vorhanden.</p>
      </div>
    </div>
  </div>

    <BfsgRequestModal v-if="bfsgModal" :fsName="baseData.name" :fsId="baseData.fs_id" v-model="bfsgModal"/>
    <VorankuendigungRequestModal v-if="vorankuendigungModal" :fsName="baseData.name" :fsId="baseData.fs_id"
                                 v-model="vorankuendigungModal"/>
</template>

<style scoped>
.card-header {
  cursor: pointer;
}
</style>