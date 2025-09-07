<script setup lang="ts">
import type {INewPayoutRequestData} from "@/interfaces";
import {euroCents, parseCommentFields} from "../../util";
import {computed} from "vue";

const props = defineProps<{
  before: INewPayoutRequestData | null | undefined,
  after: INewPayoutRequestData | null | undefined,
}>();

const extraCommentFields = computed(()=>!(props.before?.type === 'AFSG' || props.after?.type === 'AFSG'))

const idClass = computed(()=>(props.before?.request_id !== props.after?.request_id) ? 'tag is-warning' : 'tag');
const categoryClass = computed(()=>(props.before?.category !== props.after?.category) ? 'tag is-warning' : 'tag');
const statusClass = computed(()=>(props.before?.status !== props.after?.status) ? 'tag is-warning' : 'tag');
const amountClass = computed(()=>(props.before?.amount_cents !== props.after?.amount_cents) ? 'tag is-warning' : 'tag');
const dateClass = computed(()=>(props.before?.completion_deadline !== props.after?.completion_deadline) ? 'tag is-warning' : 'tag');
const deadlineClass = computed(()=>(props.before?.comment !== props.after?.comment) ? 'tag is-warning' : 'tag');
const referenceClass = computed(()=>(props.before?.reference !== props.after?.reference) ? 'tag is-warning' : 'tag');
const parsedCommentBefore = computed(()=>parseCommentFields(props.before?.comment))
const parsedCommentAfter = computed(()=>parseCommentFields(props.after?.comment))
const titleClass = computed(()=>(parsedCommentBefore.value.title !== parsedCommentAfter.value.title) ? 'tag is-warning' : 'tag');
const descriptionClass = computed(()=>(parsedCommentBefore.value.description !== parsedCommentAfter.value.description) ? 'tag is-warning' : 'tag');
const participantscountClass = computed(()=>(parsedCommentBefore.value.participantscount !== parsedCommentAfter.value.participantscount) ? 'tag is-warning' : 'tag');
const fidClass = computed(()=>(parsedCommentBefore.value.fid !== parsedCommentAfter.value.fid) ? 'tag is-warning' : 'tag');
const commentClass = computed(()=>(parsedCommentBefore.value.comment !== parsedCommentAfter.value.comment) ? 'tag is-warning' : 'tag');
</script>

<template>
  <td>
    <ul v-if="before">
      <li>ID: <span :class="idClass">{{before.request_id}}</span></li>
      <li>Kategorie: <span :class="categoryClass">{{before.category}}</span></li>
      <li>Status: <span :class="statusClass">{{before.status}}</span></li>
      <li>Betrag: <span :class="amountClass">{{euroCents(before.amount_cents)}}</span></li>
      <li>Antragsdatum: <span :class="dateClass">{{before.request_date}}</span></li>
      <li>Deadline: <span :class="deadlineClass">{{before.completion_deadline}}</span></li>
      <li>Kommentar: <span :class="commentClass">{{parsedCommentBefore.comment}}</span></li>
      <template v-if="extraCommentFields">
        <li>Titel: <span :class="titleClass">{{parsedCommentBefore.title}}</span></li>
        <li>Beschreibung: <span :class="descriptionClass">{{parsedCommentBefore.description}}</span></li>
        <li>Anz. Teilnehmende: <span :class="participantscountClass">{{parsedCommentBefore.participantscount}}</span></li>
        <li>FID: <span :class="fidClass">{{parsedCommentBefore.fid}}</span></li>
      </template>
      <li>Referenz: <span :class="referenceClass">{{before.reference}}</span></li>
    </ul>
    <p v-else>-nix-</p>
  </td>
  <td>
    <ul v-if="after">
      <li>ID: <span :class="idClass">{{after.request_id}}</span></li>
      <li>Kategorie: <span :class="categoryClass">{{after.category}}</span></li>
      <li>Status: <span :class="statusClass">{{after.status}}</span></li>
      <li>Betrag: <span :class="amountClass">{{euroCents(after.amount_cents)}}</span></li>
      <li>Antragsdatum: <span :class="dateClass">{{after.request_date}}</span></li>
      <li>Deadline: <span :class="deadlineClass">{{after.completion_deadline}}</span></li>
      <li>Kommentar: <span :class="commentClass">{{parsedCommentBefore.comment}}</span></li>
      <template v-if="extraCommentFields">
        <li>Titel: <span :class="titleClass">{{parsedCommentAfter.title}}</span></li>
        <li>Beschreibung: <span :class="descriptionClass">{{parsedCommentAfter.description}}</span></li>
        <li>Anz. Teilnehmende: <span :class="participantscountClass">{{parsedCommentAfter.participantscount}}</span></li>
        <li>FID: <span :class="fidClass">{{parsedCommentAfter.fid}}</span></li>
      </template>
      <li>Referenz: <span :class="referenceClass">{{after.reference}}</span></li>
    </ul>
    <p v-else>-nix-</p>
  </td>
</template>

<style scoped>

</style>