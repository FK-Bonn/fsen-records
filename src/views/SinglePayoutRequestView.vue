<script setup lang="ts">

import {useRoute} from "vue-router";
import {computed, onMounted, ref, type Ref, watch} from "vue";
import {AnnotationLevel, type IDocumentData, type IFullPayoutRequestData} from "@/interfaces";
import {
  acceptsDocuments,
  getDocumentsForPayoutRequest,
  getPayoutRequestHistory,
  getStatusTagClass,
  hasAnyFsPermission,
  hasFsPermission,
  updatePageTitle
} from "@/util";
import {useTokenStore} from "@/stores/token";
import PayoutRequestTable from "@/components/payoutrequest/PayoutRequestTable.vue";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import RequestEditModal from "@/components/payoutrequest/RequestEditModal.vue";
import {useAccountStore} from "@/stores/account";
import BVDocumentUploadForm from "@/components/document/BVDocumentUploadForm.vue";
import SingleBVDocument from "@/components/document/SingleBVDocument.vue";
import CopyableTag from "@/components/CopyableTag.vue";

const route = useRoute();
const token = useTokenStore();
const account = useAccountStore();
const payoutRequests = usePayoutRequestStore();

const completedHistoryRequest: Ref<IFullPayoutRequestData[] | null> = ref(null);
const historyMessage: Ref<string | null> = ref(null);
const completedDocumentsRequest: Ref<IDocumentData[] | null> = ref(null);
const documentsMessage: Ref<string | null> = ref(null);
const requestId = route.params.requestId as string;
const type_ = computed(() => requestId.startsWith('A') ? 'afsg' : requestId.startsWith('B') ? 'bfsg' : requestId.startsWith('V') ? 'vorankuendigung' : 'error');
const requestType = computed(() => (type_.value === 'vorankuendigung') ? 'Vorankündigung' : type_.value.toUpperCase() + '-Antrag');
const editModal = ref(false);
const showObsoleteFiles = ref(false);
const thisPayoutRequest = computed(() => {
  let requests = null;
  if (type_.value === "afsg") {
    requests = payoutRequests.afsg;
  }
  if (type_.value === "bfsg") {
    requests = payoutRequests.bfsg;
  }
  if (type_.value === "vorankuendigung") {
    requests = payoutRequests.vorankuendigung;
  }
  if (requests) {
    for (const [fs_id, fs_requests] of requests) {
      for (const request of fs_requests) {
        if (request.request_id === requestId) {
          return request;
        }
      }
    }
  }
  return null;
})
const showUploadForm = computed(() => thisPayoutRequest.value && acceptsDocuments(thisPayoutRequest.value.status)
    && (account.user?.admin || hasFsPermission(account.user?.permissions, thisPayoutRequest.value.fs, 'upload_documents')))
const showMissingUploadPermissionNotice = computed(() => thisPayoutRequest.value && acceptsDocuments(thisPayoutRequest.value.status)
    && hasAnyFsPermission(account.user?.permissions, thisPayoutRequest.value.fs))
const showNotAcceptingUploadsNotice = computed(() => thisPayoutRequest.value && !acceptsDocuments(thisPayoutRequest.value.status)
    && account.user)
const tagClass = computed(() => getStatusTagClass(thisPayoutRequest.value));
const hasNoObsoleteAnnotation = (document: IDocumentData) => {
  return !(document.annotations || []).some(annotation => annotation.level === AnnotationLevel.Obsolete);
}
const filteredDocuments = computed(() => {
  if (completedDocumentsRequest.value) {
    if (showObsoleteFiles.value) {
      return completedDocumentsRequest.value;
    }
    return completedDocumentsRequest.value.filter(hasNoObsoleteAnnotation)
  }
  return [];
})

const loadHistory = () => {
  getPayoutRequestHistory(requestId, type_.value, token.token())
      .then(data => {
        if (data) {
          completedHistoryRequest.value = data;
        }
      }).catch(reason => historyMessage.value = reason);
}

const loadDocuments = () => {
  getDocumentsForPayoutRequest(requestId, token.token())
      .then(data => {
        if (data) {
          completedDocumentsRequest.value = data;
        }
      }).catch(reason => documentsMessage.value = reason);
}

const showEditModal = () => {
  editModal.value = true;
}

onMounted(() => {
  loadHistory();
  loadDocuments();
  updatePageTitle(requestId);
})

watch(thisPayoutRequest, async () => {
  loadHistory();
})

</script>

<template>
  <div class="section">
    <div class="content">
      <h1 class="title is-1">{{ requestType }} {{ requestId }}</h1>
      <template v-if="thisPayoutRequest">

        <button v-if="account.user?.admin" class="button is-small" @click.stop="showEditModal"
                title="Antrag bearbeiten">
          ✏️
        </button>

        <PayoutRequestTable :payoutRequest="thisPayoutRequest" :previous="null"/>
      </template>

      <hr>

      <template v-if="['bfsg', 'vorankuendigung'].includes(type_)">
        <h2 class="title is-2">Zugehörige Dateien</h2>

        <template v-if="showUploadForm && thisPayoutRequest">
          <BVDocumentUploadForm :fs="thisPayoutRequest.fs" :category="type_.toUpperCase()" :requestId="requestId"
                                @reload-documents="loadDocuments()"/>
        </template>
        <template v-else-if="showMissingUploadPermissionNotice">
          <article class="message is-info">
            <div class="message-body">
              Um für Anträge Dokumente hochzuladen,
              benötigst du die Berechtigung "⬆️ Dokumente hochladen".
            </div>
          </article>
        </template>
        <template v-if="showNotAcceptingUploadsNotice && thisPayoutRequest">
          <article class="message is-info">
            <div class="message-body">
              Dieser Antrag ist im Status
              <CopyableTag :text="thisPayoutRequest.status" :copyText="thisPayoutRequest.status" :bold="false"
                           :tagClass="tagClass"/>&zwj;.
              Deshalb können für diesen Antrag keine Dokumente mehr hochgeladen werden.
            </div>
          </article>
        </template>


        <template v-if="documentsMessage">
          <p>{{ documentsMessage }} 😵‍💫</p>
        </template>
        <template v-else-if="completedDocumentsRequest && thisPayoutRequest">
          <p v-if="completedDocumentsRequest.length === 0">Keine Dateien vorhanden.</p>
          <template v-else>
            <ul>
              <li v-for="document in filteredDocuments" :key="document.sha256hash">
                <SingleBVDocument :document="document" :fsId="thisPayoutRequest.fs"
                                  @reload-documents="loadDocuments()"/>
              </li>
            </ul>
            <label for="showObsoleteFiles">
              <input type="checkbox" id="showObsoleteFiles" v-model="showObsoleteFiles"/>
              Obsolete Dateien anzeigen
            </label>
          </template>
        </template>
        <hr>
      </template>


      <h2 class="title is-2">Bearbeitungsverlauf</h2>
      <template v-if="historyMessage">
        <p>{{ historyMessage }} 😵‍💫</p>
      </template>
      <template v-else-if="completedHistoryRequest">

        <template v-for="(requestState, i) in completedHistoryRequest" :key="i">
          <PayoutRequestTable
              :payoutRequest="requestState"
              :previous="i===(completedHistoryRequest.length-1)?null:completedHistoryRequest[i+1]"
          />
          <RouterLink v-if="account.user?.admin && i === 0"
                      :to="{name: 'delete-request', params: {requestId: requestId}}">
            <small>😵 Aktuelle Version dieses Antrags löschen</small>
          </RouterLink>
          <hr>
        </template>

        <template v-if="editModal && completedHistoryRequest[0]">
          <RequestEditModal :payoutRequest="completedHistoryRequest[0]" :type="type_" v-model="editModal"/>
        </template>

      </template>
      <template v-else>
        <p>Daten werden geladen…</p>
      </template>

    </div>
  </div>
</template>

<style scoped>
ul, ul:not(:last-child) {
  list-style: none !important;
  margin-top: .2em !important;
  margin-bottom: .1em;
}
</style>