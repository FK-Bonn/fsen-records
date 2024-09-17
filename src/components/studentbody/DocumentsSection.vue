<script setup lang="ts">

import AngleIndicator from "@/components/icons/AngleIndicator.vue";
import {ref} from "vue";
import type {IStudentBody} from "@/interfaces";
import DocumentsList from "@/components/document/DocumentsList.vue";
import DocumentUploadForm from "@/components/document/DocumentUploadForm.vue";
import {getDocumentData} from "@/util";
import {useDocumentsStore} from "@/stores/documents";
import {useFixedDateStore} from "@/stores/fixedDate";

defineProps<{
  studentBody: IStudentBody,
}>()

const documents = useDocumentsStore();
const fixedDate = useFixedDateStore();

const opened = ref(false);
const toggle = () => {
  opened.value = !opened.value;
}

const reloadDocuments = () => {
  getDocumentData(fixedDate.date)
      .then(data => {
        documents.data = data;
      });
};

</script>

<template>
  <div class="card">
    <header class="card-header" @click="toggle">
      <p class="card-header-title">
        Dokumente
      </p>
      <button class="card-header-icon" aria-label="more options">
        <AngleIndicator :opened="opened"/>
      </button>
    </header>
    <DocumentUploadForm v-if="opened" :fs="studentBody.id" @reload-documents="reloadDocuments()"/>
    <DocumentsList v-if="opened" :studentBody="studentBody"/>
  </div>
</template>

<style scoped>
.card-header {
  cursor: pointer;
}
</style>
