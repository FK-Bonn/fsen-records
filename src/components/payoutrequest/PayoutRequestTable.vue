<script setup lang="ts">
import type {IFullPayoutRequestData, INewPayoutRequestData} from "@/interfaces";
import CopyableTag from "@/components/CopyableTag.vue";
import {computed} from "vue";
import {euroCents, getStatusTagClass} from "@/util";

const props = withDefaults(defineProps<{
  payoutRequest: INewPayoutRequestData | IFullPayoutRequestData,
  previous: INewPayoutRequestData | IFullPayoutRequestData | null,
}>(), {previous: null})
const tagClass = computed(() => getStatusTagClass(props.payoutRequest));
const previousTagClass = computed(() => getStatusTagClass(props.previous));
const categoryChanged = computed(() => props.previous && props.previous?.category !== props.payoutRequest.category);
const requestDateChanged = computed(() => props.previous && props.previous?.request_date !== props.payoutRequest.request_date);
const statusChanged = computed(() => props.previous && props.previous?.status !== props.payoutRequest.status);
const statusDateChanged = computed(() => props.previous && props.previous?.status_date !== props.payoutRequest.status_date);
const amountCentsChanged = computed(() => props.previous && props.previous?.amount_cents !== props.payoutRequest.amount_cents);
const commentChanged = computed(() => props.previous && props.previous?.comment !== props.payoutRequest.comment);
const deadlineChanged = computed(() => props.previous && props.previous?.completion_deadline !== props.payoutRequest.completion_deadline);
const referenceChanged = computed(() => props.previous && props.previous?.reference !== props.payoutRequest.reference);
</script>

<template>
  <table class="table is-narrow">
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
        <CopyableTag :text="payoutRequest.request_id"/>
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
        <CopyableTag :text="euroCents(payoutRequest.amount_cents)" :bold="true"/>
      </td>
      <td v-else>
        <CopyableTag :text="euroCents(previous?.amount_cents)" tagClass="is-light is-strikethrough"/>
        <br>
        <CopyableTag :text="euroCents(payoutRequest.amount_cents)" :bold="true"/>
      </td>
    </tr>
    <tr :class="commentChanged ? 'has-background-warning' : ''">
      <th>Kommentar</th>
      <td v-if="!commentChanged">{{ payoutRequest.comment }}</td>
      <td v-else>
        <del>{{ previous?.comment }}</del>
        <br>
        <b>{{ payoutRequest.comment }}</b>
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
      <td>{{ payoutRequest.requester || '(versteckt)' }}</td>
    </tr>
    <tr>
      <th>Zuletzt modifiziert am</th>
      <td>{{ payoutRequest.last_modified_timestamp || '(versteckt)' }}</td>
    </tr>
    <tr>
      <th>Zuletzt modifiziert von</th>
      <td>{{ payoutRequest.last_modified_by || '(versteckt)' }}</td>
    </tr>
  </table>
</template>

<style scoped>

</style>