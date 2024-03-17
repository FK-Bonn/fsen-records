<script setup lang="ts">
import type {IAnnotatedDocument} from "@/interfaces";
import {computed} from "vue";

const props = defineProps<{
  before: IAnnotatedDocument | null | undefined,
  after: IAnnotatedDocument | null | undefined,
}>();

const jsonRepresentationIsDifferent = (first: any, second: any) => {
  return JSON.stringify(first) !== JSON.stringify(second);
}

const checkedChanged = computed(() => props.before?.checked !== props.after?.checked);
const referencesChanged = computed(() => props.before?.references.join(',') !== props.after?.references.join(','));
const annotationsChanged = computed(() => jsonRepresentationIsDifferent(props.before?.annotations, props.after?.annotations));
const referenceAnnotationsChanged = computed(() => !referencesChanged.value && jsonRepresentationIsDifferent(props.before?.resolvedReferences, props.after?.resolvedReferences));
</script>

<template>
  <td>
    <template v-if="before">
      <code>{{ before.filename }}</code>
      <ul>
        <li v-if="checkedChanged">geprüft: {{ before.checked ? 'Ja' : 'Nein' }}</li>
        <li v-if="referencesChanged">Referenzen:
          <ul>
            <template v-if="before.references.length">
              <li v-for="reference in before.references" :key="reference">
                <code>{{ reference }}</code>
              </li>
            </template>
            <li v-else>–</li>
          </ul>
        </li>
        <li v-if="annotationsChanged">Anmerkungen:
          <ul>
            <template v-if="before.annotations.length">
              <li v-for="annotation in before.annotations" :key="annotation.text">
                {{ annotation.level }}: {{annotation.text}}
              </li>
            </template>
            <li v-else>–</li>
          </ul>
        </li>
        <li v-if="before.references.length > 0 && referenceAnnotationsChanged">
        <span class="has-text-grey has-background-grey-lighter">
          Anmerkungen von Referenzen wurden modifiziert
        </span>
        </li>
      </ul>
    </template>
    <span v-else class="has-text-grey has-background-grey-lighter">(wurde neu erstellt)</span>
  </td>
  <td>
    <template v-if="after">
      <code>{{ after.filename }}</code>
      <ul>
        <li v-if="checkedChanged">geprüft: {{ after.checked ? 'Ja' : 'Nein' }}</li>
        <li v-if="referencesChanged">Referenzen:
          <ul>
            <template v-if="after.references.length">
              <li v-for="reference in after.references" :key="reference">
                <code>{{ reference }}</code>
              </li>
            </template>
            <li v-else>–</li>
          </ul>
        </li>
        <li v-if="annotationsChanged">Anmerkungen:
          <ul>
            <template v-if="after.annotations.length">
              <li v-for="annotation in after.annotations" :key="annotation.text">
                {{ annotation.level }}: {{annotation.text}}
              </li>
            </template>
            <li v-else>–</li>
          </ul>
        </li>
        <li v-if="after.references.length > 0 && referenceAnnotationsChanged">
        <span class="has-text-grey has-background-grey-lighter">
          Anmerkungen von Referenzen wurden modifiziert
        </span>
        </li>
      </ul>
    </template>
    <span v-else class="has-text-grey has-background-grey-lighter">(wurde neu erstellt)</span>
  </td>
</template>

<style scoped>
td {
  width: 42.5%;
}
</style>