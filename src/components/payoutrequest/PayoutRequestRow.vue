<script setup lang="ts">

import {useScieboDataStore} from "@/stores/scieboData";
import CopyableTag from "@/components/CopyableTag.vue";
import type {IAllFsData, INewPayoutRequestData} from "@/interfaces";
import {euroCents, getStatusTagClass} from "@/util";
import {useAccountStore} from "@/stores/account";
import {computed, ref} from "vue";
import {useAllFsData} from "@/stores/allFsData";
import RequestEditModal from "@/components/payoutrequest/RequestEditModal.vue";
import RequestHistoryModal from "@/components/payoutrequest/RequestHistoryModal.vue";
import SimpleCopyableTag from "@/components/SimpleCopyableTag.vue";

const props = defineProps<{
  payoutRequest: INewPayoutRequestData,
  singleFS: boolean,
  type: string,
}>()

const account = useAccountStore();
const sciebo = useScieboDataStore();
const fsData = useAllFsData();


const editModal = ref(false);
const historyModal = ref(false);

const getTableLine = (allData: IAllFsData | null, payoutRequest: INewPayoutRequestData, budgetTitle: string): string => {
  if (!payoutRequest || !allData) {
    return '';
  }
  if (payoutRequest.type === 'vorankuendigung') {
    return 'Vorankündigungen können nicht ausgezahlt werden 🙃';
  }
  let iban = 'IBAN';
  const fsId = payoutRequest.fs;
  const fsName = fsId;
  if (Object.prototype.hasOwnProperty.call(allData, fsId)) {
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


const showEditModal = () => {
  editModal.value = true;
  historyModal.value = false;
}

const showHistoryModal = () => {
  editModal.value = false;
  historyModal.value = true;
}

const tagClass = computed(() => getStatusTagClass(props.payoutRequest));
const budgetTitle = computed(() => sciebo.data?.budgetTitlesBfsg ? sciebo.data?.budgetTitlesBfsg[props.payoutRequest.semester] : '');
const tableLine = computed(() => getTableLine(fsData.data, props.payoutRequest, budgetTitle.value));
</script>

<template>
  <tr>
    <td>
      <SimpleCopyableTag :text="payoutRequest.request_id"/>
    </td>
    <td v-if="!singleFS"><span class="fs-name">{{payoutRequest.fs}}</span></td>
    <td>
      <SimpleCopyableTag v-if="payoutRequest.reference" :text="payoutRequest.reference"/>
    </td>
    <td>{{ payoutRequest.category }}</td>
    <td>{{ payoutRequest.semester }}</td>
    <td>
      <CopyableTag :text="euroCents(payoutRequest.amount_cents)" :copy-text="undefined" :bold="true"
                   tag-class="is-light"/>
    </td>
    <td>
      <CopyableTag :tagClass="tagClass" :text="payoutRequest.status" :copyText="tableLine" :bold="false"/>
    </td>
    <td>
      <button class="button is-small" @click.stop="showHistoryModal"
              title="Bearbeitungsverlauf anzeigen">
        📜
      </button>
      <button v-if="account.user?.admin" class="button is-small" @click.stop="showEditModal" title="Antrag bearbeiten">
        ✏️
      </button>
    </td>
  </tr>
  <RequestEditModal v-if="editModal && payoutRequest" :payoutRequest="payoutRequest" :type="type" v-model="editModal"/>
  <RequestHistoryModal v-if="historyModal && payoutRequest" :payoutRequestId="payoutRequest.request_id" :type="type"
                       v-model="historyModal"/>

</template>

<style scoped>
.tags {
  margin-bottom: 0;
}

.tag {
  margin-bottom: 0;
}

.fs-name {
  display: inline-block;
  max-width: 20rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>