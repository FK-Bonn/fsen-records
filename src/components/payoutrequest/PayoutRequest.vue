<script setup lang="ts">
import type {IAllFsData, INewPayoutRequestData} from "@/interfaces";
import type {Interval} from "@/Calculator";
import {computed, ref} from "vue";
import CopyableTag from "@/components/CopyableTag.vue";
import {euroCents, getStatusTagClass, hasFsPermission, isBeforeOrOnLastDayForSubmission} from "@/util";
import {useAccountStore} from "@/stores/account";
import {useAllFsData} from "@/stores/allFsData";
import RequestModal from "@/components/payoutrequest/RequestModal.vue";
import RequestHistoryModal from "@/components/payoutrequest/RequestHistoryModal.vue";
import RequestEditModal from "@/components/payoutrequest/RequestEditModal.vue";
import {useFixedDateStore} from "@/stores/fixedDate";
import SimpleCopyableTag from "@/components/SimpleCopyableTag.vue";

const props = defineProps<{
  payoutRequest: INewPayoutRequestData | undefined,
  fsName: string,
  fsId: string,
  budgetTitle: string | null | undefined,
  semester: Interval,
}>()

const account = useAccountStore();
const allFsData = useAllFsData();
const fixedDate = useFixedDateStore();

const modal = ref(false);
const editModal = ref(false);
const historyModal = ref(false);


const getTableLine = (allData: IAllFsData | null, payoutRequest: INewPayoutRequestData | undefined,
                      fsName: string, fsId: string, budgetTitle: string | null | undefined): string => {
  if (!payoutRequest) {
    return '';
  }
  let iban = 'IBAN';
  if (allData && Object.prototype.hasOwnProperty.call(allData, fsId)) {
    const fsData = allData[fsId];
    if (fsData.protected) {
      if (fsData.protected.is_latest) {
        iban = fsData.protected.data.iban;
      } else {
        iban = 'DIE INTERNEN DATEN WURDEN MODIFIZIERT, BITTE PRÜFEN, GGF BESTÄTIGEN, DANN NEU KOPIEREN';
      }
    }
  }
  return [
    budgetTitle,
    fsName,
    payoutRequest.request_id,
    payoutRequest.request_date,
    euroCents(payoutRequest.amount_cents),
    iban,
  ].join('\t')
}

const showModal = () => {
  modal.value = true;
}
const showHistoryModal = () => {
  historyModal.value = true;
}
const showEditModal = () => {
  editModal.value = true;
}
const tagClass = computed(() => props.payoutRequest ? getStatusTagClass(props.payoutRequest) : '');
const tableLine = computed(() => getTableLine(allFsData.data, props.payoutRequest, props.fsName, props.fsId, props.budgetTitle));
const isRequestAllowed = computed(() => fixedDate.date === null && isBeforeOrOnLastDayForSubmission(props.semester, null) && (account.user?.admin || hasFsPermission(account.user?.permissions, props.fsId, 'submit_payout_request')));

</script>

<template>
  <template v-if="payoutRequest">
    <div class="tags card-header-icon">
      <CopyableTag :tagClass="tagClass" :text="payoutRequest.status" :copyText="tableLine" :bold="false"/>
      <SimpleCopyableTag :text="payoutRequest.request_id"/>
      <CopyableTag :text="euroCents(payoutRequest.amount_cents)" :copy-text="undefined" tag-class="is-light"
                   :bold="true"/>
      <button class="button is-small" @click.stop="showHistoryModal" title="Bearbeitungsverlauf anzeigen">
        📜
      </button>
      <button v-if="account.user?.admin && !fixedDate.date" class="button is-small" @click.stop="showEditModal" title="Antrag bearbeiten">
        ✏️
      </button>
    </div>
  </template>
  <template v-else-if="isRequestAllowed">
    <div class="card-header-icon">
      <button class="button is-small" @click.stop="showModal">Antrag stellen</button>
    </div>
  </template>
  <template v-if="modal">
    <RequestModal :fsName="fsName" :fsId="fsId" :semester="semester" v-model="modal"/>
  </template>
  <template v-if="editModal && payoutRequest">
    <RequestEditModal :payoutRequest="payoutRequest" type="afsg" v-model="editModal"/>
  </template>
  <template v-if="historyModal && payoutRequest">
    <RequestHistoryModal :payoutRequestId="payoutRequest.request_id" type="afsg" v-model="historyModal"/>
  </template>
</template>

<style scoped>
.tags {
  margin-bottom: 0;
}

.tag {
  margin-bottom: 0;
}
</style>