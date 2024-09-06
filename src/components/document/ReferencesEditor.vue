<script setup lang="ts">
import {type Ref, type ComputedRef, computed, ref, watch} from "vue";
import type {IDocumentData, IDocumentReference} from "@/interfaces";
import AutocompleteInput from "@/components/AutocompleteInput.vue";
import {useDocumentsStore} from "@/stores/documents";
import {refKey} from "@/util";

const props = defineProps<{
  fs: string,
}>()

const emit = defineEmits<{
  input: []
}>()

const references = defineModel<IDocumentReference[]>({required: true});

const documents = useDocumentsStore();
const items: ComputedRef<IDocumentData[]> = computed(()=>documents.data ? documents.data[props.fs] :[]);

const selectedReference: Ref<IDocumentData|null> = ref(null);

const deleteReference = (i: number) => {
  references.value = references.value.filter((value, index) => index !== i);
}

watch(selectedReference, (value: IDocumentData|null)=>{
  if(value){
    references.value.push({
      "category": value.category,
      "request_id": value.request_id,
      "base_name": value.base_name,
      "date_start": value.date_start||null,
      "date_end": value.date_end||null,
    });
  }
  selectedReference.value = null;
})

</script>

<template>
  <ul>
    <li v-for="(reference, i) in references" :key="refKey(reference)">
      {{ JSON.stringify(reference) }}
      <button class="button is-outlined is-danger is-small" @click.prevent="deleteReference(i)">Löschen</button>
    </li>
  </ul>
  <AutocompleteInput :is-async="false" :items="items" v-model="selectedReference"/>
</template>

<style scoped>

</style>