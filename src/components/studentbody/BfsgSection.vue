<script setup lang="ts">
import type {IStudentBody} from "@/interfaces";
import {computed, ref} from "vue";
import AngleIndicator from "@/components/icons/AngleIndicator.vue";
import {useAccountStore} from "@/stores/account";
import PayoutRequestsTable from "@/components/payoutrequest/PayoutRequestsTable.vue";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import BfsgRequestModal from "@/components/payoutrequest/BfsgRequestModal.vue";
import VorankuendigungRequestModal from "@/components/payoutrequest/VorankuendigungRequestModal.vue";

const props = defineProps<{
  studentBody: IStudentBody,
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

const vorankuendigungPayoutRequests = computed(() => payoutRequests.vorankuendigung?.get(props.studentBody.id))
const bfsgPayoutRequests = computed(() => payoutRequests.bfsg?.get(props.studentBody.id))

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
        <button v-if="account.user?.admin" class="button is-outlined is-small" @click.stop="showVorankuendigungModal">
          Antrag stellen
        </button>
        <PayoutRequestsTable v-if="vorankuendigungPayoutRequests" :singleFS="true"
                             :bfsgPayoutRequests="vorankuendigungPayoutRequests"
                             type="vorankuendigung"/>
        <p v-else class="has-text-grey-dark">Keine vorhanden.</p>

        <h3 class="heading is-3">BFSG-Anträge</h3>
        <button v-if="account.user?.admin" class="button is-outlined is-small" @click.stop="showBfsgModal">
          Antrag stellen
        </button>
        <PayoutRequestsTable v-if="bfsgPayoutRequests" :singleFS="true" :bfsgPayoutRequests="bfsgPayoutRequests"
                             type="bfsg"/>
        <p v-else class="has-text-grey-dark">Keine vorhanden.</p>
      </div>
    </div>
  </div>

    <BfsgRequestModal v-if="bfsgModal" :fsName="studentBody.name" :fsId="studentBody.id" v-model="bfsgModal"/>
    <VorankuendigungRequestModal v-if="vorankuendigungModal" :fsName="studentBody.name" :fsId="studentBody.id"
                                 v-model="vorankuendigungModal"/>
</template>

<style scoped>
.card-header {
  cursor: pointer;
}
</style>