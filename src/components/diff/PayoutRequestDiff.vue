<script setup lang="ts">
import type {INewPayoutRequestData} from "@/interfaces";
import {euroCents} from "../../util";
import {computed} from "vue";

const props = defineProps<{
  before: INewPayoutRequestData | null | undefined,
  after: INewPayoutRequestData | null | undefined,
}>();

const idClass = computed(()=>(props.before?.request_id !== props.after?.request_id) ? 'tag is-warning' : 'tag');
const categoryClass = computed(()=>(props.before?.category !== props.after?.category) ? 'tag is-warning' : 'tag');
const statusClass = computed(()=>(props.before?.status !== props.after?.status) ? 'tag is-warning' : 'tag');
const amountClass = computed(()=>(props.before?.amount_cents !== props.after?.amount_cents) ? 'tag is-warning' : 'tag');
const dateClass = computed(()=>(props.before?.completion_deadline !== props.after?.completion_deadline) ? 'tag is-warning' : 'tag');
const deadlineClass = computed(()=>(props.before?.comment !== props.after?.comment) ? 'tag is-warning' : 'tag');
const commentClass = computed(()=>(props.before?.comment !== props.after?.comment) ? 'tag is-warning' : 'tag');
const referenceClass = computed(()=>(props.before?.reference !== props.after?.reference) ? 'tag is-warning' : 'tag');
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
      <li>Kommentar: <span :class="commentClass">{{before.comment}}</span></li>
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
      <li>Kommentar: <span :class="commentClass">{{after.comment}}</span></li>
      <li>Referenz: <span :class="referenceClass">{{after.reference}}</span></li>
    </ul>
    <p v-else>-nix-</p>
  </td>
</template>

<style scoped>

</style>