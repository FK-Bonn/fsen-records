<script setup lang="ts">
import type {IFullPayoutRequestData, INewPayoutRequestData} from "@/interfaces";
import CopyableTag from "@/components/CopyableTag.vue";
import {computed} from "vue";
import {euroCents, parseCommentFields} from "@/util";
import SimpleCopyableTag from "@/components/SimpleCopyableTag.vue";

const props = defineProps<{
  payoutRequest: INewPayoutRequestData | IFullPayoutRequestData | null,
  previous: INewPayoutRequestData | IFullPayoutRequestData | null,
}>();
const categoryChanged = computed(() => props.previous && props.previous?.category !== props.payoutRequest?.category);
const requestDateChanged = computed(() => props.previous && props.previous?.request_date !== props.payoutRequest?.request_date);
const statusChanged = computed(() => props.previous && props.previous?.status !== props.payoutRequest?.status);
const statusDateChanged = computed(() => props.previous && props.previous?.status_date !== props.payoutRequest?.status_date);
const amountCentsChanged = computed(() => props.previous && props.previous?.amount_cents !== props.payoutRequest?.amount_cents);
const previousCommentFields = computed(()=>parseCommentFields(props.previous?.comment))
const currentCommentFields = computed(()=>parseCommentFields(props.payoutRequest?.comment))
const titleChanged = computed(() => props.previous && previousCommentFields.value.title !== currentCommentFields.value.title);
const descriptionChanged = computed(() => props.previous && previousCommentFields.value.description !== currentCommentFields.value.description);
const participantscountChanged = computed(() => props.previous && previousCommentFields.value.participantscount !== currentCommentFields.value.participantscount);
const fidChanged = computed(() => props.previous && previousCommentFields.value.fid !== currentCommentFields.value.fid);
const commentChanged = computed(() => props.previous && previousCommentFields.value.comment !== currentCommentFields.value.comment);
const deadlineChanged = computed(() => props.previous && props.previous?.completion_deadline !== props.payoutRequest?.completion_deadline);
const referenceChanged = computed(() => props.previous && props.previous?.reference !== props.payoutRequest?.reference);
</script>

<template>
  <table class="table is-narrow" v-if="payoutRequest !== null">
    <tbody>
    <tr>
      <th>Fachschaft</th>
      <td>{{ payoutRequest.fs }}</td>
    </tr>
    <tr>
      <th>Semester</th>
      <td>{{ payoutRequest.semester }}</td>
    </tr>
    <tr>
      <th>Antragsnummer</th>
      <td>
        <SimpleCopyableTag :text="payoutRequest.request_id"/>
      </td>
    </tr>
    <tr :class="categoryChanged ? 'has-background-warning' : ''">
      <th>Kategorie</th>
      <td v-if="!categoryChanged">{{ payoutRequest.category }}</td>
      <td v-else>
        <del>{{ previous?.category }}</del>
        <br>
        <b>{{ payoutRequest.category }}</b>
      </td>
    </tr>
    <tr :class="requestDateChanged ? 'has-background-warning' : ''">
      <th>Antragsdatum</th>
      <td v-if="!requestDateChanged">{{ payoutRequest.request_date }}</td>
      <td v-else>
        <del>{{ previous?.request_date }}</del>
        <br>
        <b>{{ payoutRequest.request_date }}</b>
      </td>
    </tr>
    <tr :class="statusChanged ? 'has-background-warning' : ''">
      <th>Status</th>
      <td v-if="!statusChanged"><span class="tag {{tagClass}}">{{ payoutRequest.status }}</span></td>
      <td v-else>
        <span class="tag {{previousTagClass}}"><del>{{ previous?.status }}</del></span><br>
        <span class="tag {{tagClass}}">{{ payoutRequest.status }}</span>
      </td>
    </tr>
    <tr :class="statusDateChanged ? 'has-background-warning' : ''">
      <th>Status-Datum</th>
      <td v-if="!statusDateChanged">{{ payoutRequest.status_date }}</td>
      <td v-else>
        <del>{{ previous?.status_date }}</del>
        <br>
        <b>{{ payoutRequest.status_date }}</b>
      </td>
    </tr>
    <tr :class="amountCentsChanged ? 'has-background-warning' : ''">
      <th>Betrag</th>
      <td v-if="!amountCentsChanged">
        <CopyableTag :text="euroCents(payoutRequest.amount_cents)" :copy-text="undefined" :bold="true"
                     tag-class="is-light"/>
      </td>
      <td v-else>
        <CopyableTag :text="euroCents(previous?.amount_cents)" :copy-text="undefined"
                     tagClass="is-light is-strikethrough" :bold="false"/>
        <br>
        <CopyableTag :text="euroCents(payoutRequest.amount_cents)" :copy-text="undefined" :bold="true"
                     tag-class="is-light"/>
      </td>
    </tr>
    <template v-if="!payoutRequest.request_id.startsWith('A')">
    <tr :class="titleChanged ? 'has-background-warning' : ''">
      <th>Titel</th>
      <td v-if="!titleChanged">{{ currentCommentFields.title }}</td>
      <td v-else>
        <del>{{ previousCommentFields.title }}</del>
        <br>
        <b>{{ currentCommentFields.title }}</b>
      </td>
    </tr>
    <tr :class="descriptionChanged ? 'has-background-warning' : ''">
      <th>Beschreibung</th>
      <td v-if="!descriptionChanged">{{ currentCommentFields.description }}</td>
      <td v-else>
        <del>{{ previousCommentFields.description }}</del>
        <br>
        <b>{{ currentCommentFields.description }}</b>
      </td>
    </tr>
    <tr :class="participantscountChanged ? 'has-background-warning' : ''">
      <th>Anzahl Teilnehmende</th>
      <td v-if="!participantscountChanged">{{ currentCommentFields.participantscount }}</td>
      <td v-else>
        <del>{{ previousCommentFields.participantscount }}</del>
        <br>
        <b>{{ currentCommentFields.participantscount }}</b>
      </td>
    </tr>
    </template>
    <tr :class="commentChanged ? 'has-background-warning' : ''">
      <th>Kommentar</th>
      <td v-if="!commentChanged">{{ currentCommentFields.comment }}</td>
      <td v-else>
        <del>{{ previousCommentFields.comment }}</del>
        <br>
        <b>{{ currentCommentFields.comment }}</b>
      </td>
    </tr>
    <tr :class="fidChanged ? 'has-background-warning' : ''">
      <th>FID zur Abstimmung</th>
      <td v-if="!fidChanged">{{ currentCommentFields.fid }}</td>
      <td v-else>
        <del>{{ previousCommentFields.fid }}</del>
        <br>
        <b>{{ currentCommentFields.fid }}</b>
      </td>
    </tr>
    <tr :class="deadlineChanged ? 'has-background-warning' : ''">
      <th>Frist zur Vervollständigung</th>
      <td v-if="!deadlineChanged">{{ payoutRequest.completion_deadline }}</td>
      <td v-else>
        <del>{{ previous?.completion_deadline }}</del>
        <br>
        <b>{{ payoutRequest.completion_deadline }}</b>
      </td>
    </tr>
    <tr :class="referenceChanged ? 'has-background-warning' : ''">
      <th>Referenz</th>
      <td v-if="!referenceChanged">{{ payoutRequest.reference || '' }}</td>
      <td v-else>
        <del>{{ previous?.reference || '' }}</del>
        <br>
        <b>{{ payoutRequest.reference || '' }}</b>
      </td>
    </tr>
    <tr>
      <th>Antrag gestellt von</th>
      <td>{{ (('requester' in payoutRequest) ? (payoutRequest.requester || '(versteckt)') : '(versteckt)') }}</td>
    </tr>
    <tr>
      <th>Zuletzt modifiziert am</th>
      <td>{{
          (('last_modified_timestamp' in payoutRequest) ? (payoutRequest.last_modified_timestamp || '(versteckt)') : '(versteckt)')
        }}
      </td>
    </tr>
    <tr>
      <th>Zuletzt modifiziert von</th>
      <td>{{
          (('last_modified_by' in payoutRequest) ? (payoutRequest.last_modified_by || '(versteckt)') : '(versteckt)')
        }}
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>