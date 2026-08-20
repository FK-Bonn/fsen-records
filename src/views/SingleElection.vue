<script setup lang="ts">
import {computed, onBeforeMount, type Ref, ref} from "vue";
import {loadElectionDatesIndex, updatePageTitle} from "@/util";
import type {IElectionData} from "@/interfaces";
import ElectionContainer from "@/components/elections/ElectionContainer.vue";
import {useRoute} from "vue-router";

const index: Ref<null | IElectionData[]> = ref(null);

const route = useRoute();
const electionId = route.params.electionId as string;

const loadIndex = () => {
  loadElectionDatesIndex().then(value => index.value = value);
};
onBeforeMount(() => {
  updatePageTitle('Wahltermin');
  loadIndex();
});
const election = computed(() => index.value?.find(election => election.election_id === electionId))

</script>

<template>
  <div class="container section">
    <template v-if="election">
      <ElectionContainer :election="election" @reload-election-list="loadIndex()"/>
    </template>
    <template v-else>
      <article class="message is-danger">
        <div class="message-body">
          Es ist keine Wahl mit der ID <code>{{ electionId }}</code> bekannt.
        </div>
      </article>
    </template>

  </div>
</template>
