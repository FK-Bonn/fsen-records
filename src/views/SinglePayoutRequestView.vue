<script setup lang="ts">

import {useRoute} from "vue-router";
import {computed, onBeforeUnmount, onMounted, ref, type Ref, watch} from "vue";
import {AnnotationLevel, type IDocumentData, type IFullPayoutRequestData, type IMessageData} from "@/interfaces";
import {
  acceptsDocuments, addMessageToPayoutRequest,
  getDocumentsForPayoutRequest, getMessagesForPayoutRequest,
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
import SingleMessage from "@/components/payoutrequest/SingleMessage.vue";

const route = useRoute();
const token = useTokenStore();
const account = useAccountStore();
const payoutRequests = usePayoutRequestStore();

let interval: number | null = null;
const completedHistoryRequest: Ref<IFullPayoutRequestData[] | null> = ref(null);
const historyMessage: Ref<string | null> = ref(null);
const completedDocumentsRequest: Ref<IDocumentData[] | null> = ref(null);
const documentsMessage: Ref<string | null> = ref(null);
const completedMessagesRequest: Ref<IMessageData[] | null> = ref(null);
const messagesMessage: Ref<string | null> = ref(null);
const requestId = route.params.requestId as string;
const type_ = computed(() => requestId.startsWith('A') ? 'afsg' : requestId.startsWith('B') ? 'bfsg' : requestId.startsWith('V') ? 'vorankuendigung' : 'error');
const requestType = computed(() => (type_.value === 'vorankuendigung') ? 'Vorankündigung' : type_.value.toUpperCase() + '-Antrag');
const editModal = ref(false);
const showObsoleteFiles = ref(false);
const messageContent = ref('');
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
const showMissingUploadOrSubmitRequestPermissionNotice = computed(() => thisPayoutRequest.value
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

const loadMessages = () => {
  getMessagesForPayoutRequest(requestId, type_.value, token.token())
      .then(data => {
        if (data) {
          completedMessagesRequest.value = data;
        }
      }).catch(reason => messagesMessage.value = reason);
}

const showEditModal = () => {
  editModal.value = true;
}

const yeet = async () => {
  const message = messageContent.value;
  const previousId = (completedMessagesRequest.value && completedMessagesRequest.value.length) ? completedMessagesRequest.value[0].message_id : null;
  try {
    await addMessageToPayoutRequest(message, previousId, requestId, type_.value, token.token());
    messageContent.value = '';
  } catch (e) {
    console.log(e);
    alert("In der Zwischenzeit wurden von anderen Personen neue Nachrichten hinzugefügt.\n" +
        "Die Nachrichten werden nun neu geladen.")
  }
  loadMessages();
}

onMounted(() => {
  loadHistory();
  loadDocuments();
  loadMessages();
  updatePageTitle(requestId);
  interval = window.setInterval(loadMessages, 60 * 1000);
})

onBeforeUnmount(() => {
  if (interval !== null) {
    window.clearInterval(interval);
    interval = null;
  }
})

watch(thisPayoutRequest, async () => {
  loadHistory();
  loadDocuments();
  loadMessages();
  if (interval !== null) {
    window.clearInterval(interval);
    interval = window.setInterval(loadMessages, 60 * 1000);
  }
})

const showMessageInputBox = computed(() => (account.user?.admin
    || thisPayoutRequest.value
    && (hasFsPermission(account.user?.permissions, thisPayoutRequest.value.fs, 'submit_payout_request')
        || hasFsPermission(account.user?.permissions, thisPayoutRequest.value.fs, 'upload_documents'))
));

</script>

<template>
  <div class="section">
    <div class="content">
      <h1 class="title is-1">{{ requestType }} {{ requestId }}</h1>
      <div class="columns">
        <div class="column">
          <template v-if="thisPayoutRequest">

            <button v-if="account.user?.admin" class="button is-small" @click.stop="showEditModal"
                    title="Antrag bearbeiten">
              ✏️
            </button>

            <PayoutRequestTable :payoutRequest="thisPayoutRequest" :previous="null"/>
          </template>
        </div>
        <div class="column">

          <div class="card">
            <div class="card-header">
              <p class="card-header-title">Nachrichten zu diesem Antrag</p>
            </div>
            <div class="card-content">
              <template v-if="messagesMessage">
                {{ messagesMessage }}
              </template>
              <div class="mb-3" v-if="showMessageInputBox">
                <div class="field">
                  <label class="label">Nachricht hinzufügen</label>
                  <div class="control">
                    <textarea class="textarea" placeholder="Nachricht hier eingeben" rows="2"
                              v-model="messageContent"></textarea>
                  </div>
                </div>
                <div class="field is-grouped">
                  <div class="control">
                    <button class="button" @click="yeet">Absenden</button>
                  </div>
                </div>
              </div>
              <template v-else-if="showMissingUploadOrSubmitRequestPermissionNotice">
                <article class="message is-info">
                  <div class="message-body">
                    Um Nachrichten zu schreiben,
                    benötigst du die Berechtigung "️✏️ Anträge stellen" oder "⬆️ Dokumente hochladen".
                  </div>
                </article>
              </template>
              <template v-if="completedMessagesRequest">
                <template v-if="completedMessagesRequest.length === 0">
                  <i>Zu diesem Antrag gibt es keine Nachrichten.</i>
                </template>
                <template v-else v-for="message in completedMessagesRequest" :key="message.message_id">
                  <SingleMessage :message="message"/>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>

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