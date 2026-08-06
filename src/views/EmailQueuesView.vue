<script setup lang="ts">

import {onBeforeMount, ref, useTemplateRef} from "vue";
import {loadEmailQueues, loadEmailTemplates, saveEmailTemplate, updatePageTitle} from "@/util";
import {useTokenStore} from "@/stores/token";
import type {IEmailQueues, IEmailTemplateDataWithMeta, IEmailTemplateMeta, IMonthDay} from "@/interfaces";
import OutboxMail from "@/components/mails/OutboxMail.vue";
import SentMail from "@/components/mails/SentMail.vue";

const token = useTokenStore();

const queues = ref<null | IEmailQueues>(null);

const loadQueues = () => {
  loadEmailQueues(token.token()).then(value => queues.value = value);
};

onBeforeMount(() => {
  updatePageTitle('E-Mail-Versand');
  loadQueues();
});
</script>

<template>
  <div class="section">

    <h1 class="title is-1">E-Mail-Versand</h1>

    <h2 class="title is-2">Postausgang</h2>
    <table class="table">
      <thead>
      <tr>
        <th>Template-ID</th>
        <th>Empfänger*innen</th>
        <th>Betreff</th>
        <th>Erstellt</th>
        <th>Warten bis</th>
      </tr>
      </thead>
      <tbody v-if="queues">
      <template v-for="(mail, i) in queues.outbox" :key="i">
        <OutboxMail :mail="mail"/>
      </template>
      </tbody>
      <tbody v-else>
      <tr>
        <td colspan="5">Wird geladen…</td>
      </tr>
      </tbody>
    </table>
    <h2 class="title is-2">Versendet</h2>
    <table class="table">
      <thead>
      <tr>
        <th>Template-ID</th>
        <th>Empfänger*innen</th>
        <th>Betreff</th>
        <th>Erstellt</th>
        <th>Versendet</th>
      </tr>
      </thead>
      <tbody v-if="queues">
      <template v-for="(mail, i) in queues.sent" :key="i">
        <SentMail :mail="mail"/>
      </template>
      </tbody>
      <tbody v-else>
      <tr>
        <td colspan="5">Wird geladen…</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
