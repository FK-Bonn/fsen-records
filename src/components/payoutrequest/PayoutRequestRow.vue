<script setup lang="ts">

import CopyableTag from "@/components/CopyableTag.vue";
import type {IAllFsData, INewPayoutRequestData} from "@/interfaces";
import {euroCents, getStatusTagClass, parseCommentFields} from "@/util";
import {useAccountStore} from "@/stores/account";
import {computed, ref} from "vue";
import {useAllFsData} from "@/stores/allFsData";
import RequestEditModal from "@/components/payoutrequest/RequestEditModal.vue";
import RequestHistoryModal from "@/components/payoutrequest/RequestHistoryModal.vue";
import SimpleCopyableTag from "@/components/SimpleCopyableTag.vue";
import {META} from "@/meta";

const props = defineProps<{
  payoutRequest: INewPayoutRequestData,
  singleFS: boolean,
  type: string,
}>()

const account = useAccountStore();
const fsData = useAllFsData();


const editModal = ref(false);
const historyModal = ref(false);
const showFull = ref(false);

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
  const commentParsed = parseCommentFields(payoutRequest.comment);
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
    commentParsed.title || payoutRequest.category,
    payoutRequest.status_date + ' FID ' + commentParsed.fid,
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

const toggleShowFull = () => {
  showFull.value = !showFull.value;
}

const tagClass = computed(() => getStatusTagClass(props.payoutRequest));
const budgetTitle = computed(() => META.budgetTitlesBfsg[props.payoutRequest.semester]);
const tableLine = computed(() => getTableLine(fsData.data, props.payoutRequest, budgetTitle.value));
const trClass = computed(() => showFull.value ? "selected-tr-top" : "");
const commentFields = computed(() => parseCommentFields(props.payoutRequest.comment));
</script>

<template>
  <tr @click="toggleShowFull" :class="trClass">
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
      <RouterLink class="button is-small"
                  :to="{name: 'payout-request', params: {requestId: payoutRequest.request_id}}"
                  title="Detailseite anzeigen">
        ↗️
      </RouterLink>
    </td>
  </tr>
  <tr v-if="showFull" class="selected-tr-bottom">
    <td></td>
    <td :colspan="singleFS ? 6 : 7">
      <dl>
        <dt>Titel</dt>
        <dd>{{ commentFields.title || '–' }}</dd>
        <dt>Beschreibung</dt>
        <dd>{{ commentFields.description || '–' }}</dd>
        <dt>Anzahl Teilnehmende</dt>
        <dd>{{ commentFields.participantscount || '–' }}</dd>
        <dt>FID zur Abstimmung</dt>
        <dd>{{ commentFields.fid || '–' }}</dd>
        <dt>Kommentar</dt>
        <dd>{{ commentFields.comment || '–' }}</dd>
      </dl>
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

.selected-tr-top {
  border-width: 2px 2px 0 2px;
  border-style: solid;
  border-color: #888;
}

.selected-tr-bottom {
  border-width: 0 2px 2px 2px;
  border-style: solid;
  border-color: #888;
}

dt {
  font-weight: bold;
}

dd {
  margin-inline-start: 0;
}

</style>