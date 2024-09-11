<script setup lang="ts">
import {computed} from "vue";
import {AnnotationLevel, type IAnnotation} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import {getWorstDocumentAnnotationLevel} from "@/util";

const annotations = defineModel<IAnnotation[]>({required: true});

const deleteAnnotation = (i: number) => {
  annotations.value = annotations.value.filter((value, index) => index !== i);
}

const addAnnotation = () => {
  annotations.value.push({
    "level": AnnotationLevel.Error,
    "text": "",
  })
}

const overallAnnotation = computed(()=>getWorstDocumentAnnotationLevel(annotations.value))
</script>

<template>
  <ul>
    <li>Gesamtbewertung: <IconForLevel :level="overallAnnotation"/></li>
    <li v-for="(annotation, i) in annotations" :key="i">
      <div class="field has-addons">
        <p class="control has-icon">
          <span class="button is-static">
          <IconForLevel :level="annotation.level"/>
          </span>
        </p>
        <p class="control">
        <span class="select">
          <select v-model="annotation.level">
            <option :value="AnnotationLevel.Ok">{{ AnnotationLevel.Ok }}</option>
            <option :value="AnnotationLevel.Warning">{{ AnnotationLevel.Warning }}</option>
            <option :value="AnnotationLevel.Error">{{ AnnotationLevel.Error }}</option>
            <option :value="AnnotationLevel.Info">{{ AnnotationLevel.Info }}</option>
            <option :value="AnnotationLevel.Unchecked">{{ AnnotationLevel.Unchecked }}</option>
          </select>
        </span>
        </p>
        <p class="control is-expanded">
          <input class="input" type="text" v-model="annotation.text">
        </p>
        <p class="control">
          <button class="button is-outlined is-danger" @click.prevent="deleteAnnotation(i)">Löschen</button>
        </p>
      </div>
    </li>
    <li>
      <button class="button is-family-secondary is-small" @click.prevent="addAnnotation">Annotation hinzufügen</button>
    </li>
  </ul>
</template>

<style scoped>
.content ul {
  list-style: none;
  margin-left: 0;
}
</style>