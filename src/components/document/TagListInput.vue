<script setup lang="ts">

import {computed} from "vue";

const props = defineProps<{
  type: string,
}>()
const tagString = defineModel<string>({required: true})
const addTag = (tag: string) => {
  const items = tagString.value.split(',').map(value => value.trim());
  if (!items.includes(tag)) {
    items.push(tag);
  }
  tagString.value = items.filter(value => value !== '').join(', ');
}
const aTags = [
  {"tag": "Konsti", "title": "Konstituierende Sitzung"},
  {"tag": "HHP", "title": "Haushaltsplan"},
  {"tag": "NHHP", "title": "1. Nachtragshaushaltsplan"},
  {"tag": "NHHP2", "title": "2. Nachtragshaushaltsplan"},
  {"tag": "Wahl KP", "title": "Wahl von Kassenprüfer*innen"},
]
const bvTags = [
  {"tag": "Kostenkalkulation", "title": "Tabellarische Kostenkalkulation"},
  {"tag": "Rechnung(en)", "title": "Rechnung(en)"},
  {"tag": "Arbeitsbericht", "title": "Arbeitsbericht"},
  {"tag": "Awarenessbericht", "title": "Awarenessbericht"},
  {"tag": "Nachhaltigkeitsbericht", "title": "Nachhaltigkeitsbericht"},
  {"tag": "Programm", "title": "Programm"},
  {"tag": "Teilnahmeliste", "title": "Liste mit Unterschriften aller Teilnehmenden"},
  {"tag": "Belegexemplar", "title": "Belegexemplar"},
  {"tag": "?", "title": "nicht benötigtes Dokument"},
]
const tags = computed(() => props.type === 'AFSG' ? aTags : bvTags)
const placeholder = computed(() => `${tags.value[0].tag}, ${tags.value[1].tag}, … (optional)`)
</script>

<template>
  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">Schlagwörter</label>
    </div>
    <div class="field-body">
      <div class="field">
        <div class="control">
          <input class="input" type="text" :placeholder="placeholder" v-model="tagString">
        </div>
        <p class="help">
          <template v-for="tag in tags" :key="tag.tag">
            <button class="button is-small" @click.prevent="()=>addTag(tag.tag)"
                    :title="tag.title">{{ tag.tag }}
            </button>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
