// Adapted from: https://www.digitalocean.com/community/tutorials/vuejs-vue-autocomplete-component
<script setup lang="ts">
import {onMounted, onUnmounted, type Ref, ref, watch} from "vue";
import type {IDocumentData} from "@/interfaces";
import DocumentName from "@/components/document/DocumentName.vue";
import {assertIsNode, getDocumentPrefix} from "@/util";

const props = defineProps<{
  items: IDocumentData[],
  isAsync: boolean,
}>()

const emit = defineEmits<{
  input: []
}>()

const selected = defineModel<IDocumentData|null>({required: true});

const root: Ref<null | HTMLDivElement> = ref(null);

const isOpen = ref(false);
const results: Ref<IDocumentData[]> = ref([]);
const search = ref('');
const isLoading = ref(false);
const arrowCounter = ref(-1);

watch(props.items, (value, oldValue) => {
  if (value.length !== oldValue.length) {
    results.value = value;
    isLoading.value = false;
  }
})

const onArrowDown = () => {
  if (arrowCounter.value < results.value.length) {
    arrowCounter.value = arrowCounter.value + 1;
  }
}
const onArrowUp = () => {
  if (arrowCounter.value > 0) {
    arrowCounter.value = arrowCounter.value - 1;
  }
}
const onEnter = () => {
  setResult(results.value[arrowCounter.value]);
  arrowCounter.value = -1;
}

const setResult = (result: IDocumentData) => {
  search.value = '';
  isOpen.value = false;
  selected.value = result;
}

const filterResults = () => {
  results.value = props.items.filter((item) => {
    for (let needle of search.value.split(' ')) {
      if ((getDocumentPrefix(item) + ' ' + item.filename).toLowerCase().indexOf(needle.toLowerCase()) === -1) {
        return false;
      }
    }
    return true;
  });
}

const onChange = () => {
  emit('input');

  if (props.isAsync) {
    isLoading.value = true;
  } else {
    filterResults();
    isOpen.value = true;
  }
}

const handleClickOutside = (event: Event) => {
  assertIsNode(event.target);
  if (root.value && event.target && !root.value.contains(event.target)) {
    isOpen.value = false;
    arrowCounter.value = -1;
  }
}


onMounted(() => {
  document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});


</script>

<template>
  <div class="autocomplete" ref="root">
    <input class="input is-small"
           type="text"
           placeholder="Tippen, um auszuwählen…"
           @input="onChange"
           v-model="search"
           @keydown.down="onArrowDown"
           @keydown.up="onArrowUp"
           @keydown.enter="onEnter"
    />
    <ul
        v-show="isOpen"
        class="autocomplete-results"
    >
      <li
          class="loading"
          v-if="isLoading"
      >
        Loading results...
      </li>
      <li
          v-else
          v-for="(result, i) in results"
          :key="i"
          @click="setResult(result)"
          class="autocomplete-result"
          :class="{ 'is-active': i === arrowCounter }"
      >
        <DocumentName :document="result"/>
      </li>
    </ul>
  </div>
</template>

<style scoped>

.autocomplete {
  position: relative;
}

.autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid #eeeeee;
  height: 120px;
  overflow: auto;
  background-color: white;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  padding-bottom: var(--bulma-control-padding-vertical);
  padding-left: var(--bulma-control-padding-horizontal);
  padding-right: var(--bulma-control-padding-horizontal);
  padding-top: var(--bulma-control-padding-vertical);
  cursor: pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
  background-color: #4AAE9B;
  color: white;
}
</style>