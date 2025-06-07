<script setup lang="ts">
import {onBeforeMount, type Ref, ref} from "vue";
import type {IProtectedFsDataHistoryEntry} from "@/interfaces";
import {getProtectedFsDataHistory} from "@/util";
import {useTokenStore} from "@/stores/token";
import ProtectedFsDataHistoryEntry from "@/components/fsdata/ProtectedFsDataHistoryEntry.vue";

const show = defineModel<boolean>({required: true});
const props = defineProps<{
  fs: string,
}>();

const token = useTokenStore();

const completedRequest: Ref<IProtectedFsDataHistoryEntry[] | null> = ref(null);
const message: Ref<string | null> = ref(null);
const close = () => {
  show.value = false;
}
const loadHistory = () => {
  getProtectedFsDataHistory(props.fs, token.token())
      .then(data => {
        completedRequest.value = data;
      });
}
onBeforeMount(() => loadHistory());
</script>

<template>
  <div class="modal is-active" @click.stop>
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Interne Daten für {{ fs }}: Bearbeitungsverlauf
          </p>
        </header>
        <div class="card-content">
          <div class="content">
            <article v-if="message" class="message">
              <div class="message-body">
                {message}
              </div>
            </article>
            <template v-else-if="completedRequest">
              <template v-for="(data, i) in completedRequest" :key="i">
                <ProtectedFsDataHistoryEntry
                    :data="data"
                    :fs="fs"
                    :previous="i===(completedRequest.length-1)?null:completedRequest[i+1]"
                    v-model="show"/>
                <hr>
              </template>
            </template>
            <template v-else>
              Daten werden geladen…
            </template>
          </div>
        </div>
        <footer class="card-footer">
          <button class="button card-footer-item" @click.stop="close">Schließen</button>
        </footer>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click.stop="close"></button>
  </div>
</template>

<style scoped>

</style>