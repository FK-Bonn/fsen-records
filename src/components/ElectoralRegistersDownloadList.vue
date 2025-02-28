<script setup lang="ts">
import {nextTick, onBeforeMount, ref, type Ref, watch} from "vue";
import type {IElectoralRegistersIndex} from "@/interfaces";
import {loadElectoralRegistersIndex, scrollToHashIfPresent} from "@/util";
import ElectoralRegisterDownloadButton from "@/components/document/ElectoralRegisterDownloadButton.vue";
import {useAccountStore} from "@/stores/account";

const emit = defineEmits<{
  reloadLog: []
}>()

const account = useAccountStore();
const index: Ref<null | IElectoralRegistersIndex> = ref(null);

const loadIndex = () => {
  loadElectoralRegistersIndex().then(value => index.value = value);
};

onBeforeMount(() => {
  loadIndex();
});
watch(() => (index.value !== null), async () => {
  await nextTick();
  scrollToHashIfPresent();
});
</script>

<template>
  <div class="box content" id="index">
    <h2 class="subtitle">Verfügbare Verzeichnisse</h2>

    <div class="notification is-danger" v-if="account.user?.admin">
      <strong>Obacht!</strong>
      Jeder Download wird öffentlich protokolliert!<br>
      Ein Verzeichnis darf nur heruntergeladen werden, um es anschließend für eine Fachschaftswahl auszudrucken!
    </div>
    <div class="notification is-info" v-else>
      <strong>Ihr wählt bald?</strong>
      Eure Wahlleitung muss beim <a href="https://asta-bonn.de/de/referate/fachschaftenreferat">Fachschaftenreferat</a>
      das Wählendenverzeichnis beantragen.
    </div>

    <div v-if="index">
      <details v-for="(files, date) in index" :key="date">
        <summary>{{ date }}</summary>
        <ul>
          <li v-for="filename in files" :key="filename">
            <code>{{ date }}/{{ filename }}</code>
            <ElectoralRegisterDownloadButton
                :date="date" :filename="filename" v-if="account.user?.admin" @reload-log="()=>emit('reloadLog')"/>
          </li>
        </ul>
      </details>
    </div>
    <div v-else>Wird geladen…</div>
  </div>
</template>

<style scoped>
summary {
  cursor: pointer;
}
</style>