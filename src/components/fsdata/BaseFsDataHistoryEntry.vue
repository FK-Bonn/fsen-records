<script setup lang="ts">
import {computed, type Ref, ref} from "vue";
import {useAllFsData} from "@/stores/allFsData";
import type {IBaseFsDataHistoryEntry} from "@/interfaces";
import {approveBaseFsData, getBaseFsData, jsonRepresentationIsDifferent, putBaseFsData} from "@/util";
import {useTokenStore} from "@/stores/token";
import TS from "@/components/TS.vue";

const show = defineModel<boolean>({required: true});
const props = defineProps<{
  data: IBaseFsDataHistoryEntry,
  previous: IBaseFsDataHistoryEntry | null,
  fs: string,
}>();

const token = useTokenStore();
const allFsData = useAllFsData();

const message: Ref<string | null> = ref(null);

const loadFsData = () => {
  getBaseFsData(props.fs, token.token()).then(data => {
    if (allFsData.data && data) {
      allFsData.data[props.fs].base = data;
    }
  });
}

const approve = () => {
  approveBaseFsData(props.data.id, token.token()).then(value => {
    message.value = value?.message || null;
    loadFsData();
  })
}

const restore = () => {
  putBaseFsData(props.fs, props.data, token.token()).then(() => {
    loadFsData();
    show.value = false;
  }).catch(() => alert('Speichern fehlgeschlagen.'));
}

const fsIdChanged = computed(() => props.previous && props.previous.fs_id !== props.data.fs_id);
const nameChanged = computed(() => props.previous && props.previous.name !== props.data.name);
const statutesChanged = computed(() => props.previous && props.previous.statutes !== props.data.statutes);
const financialYearStartChanged = computed(() => props.previous && props.previous.financial_year_start !== props.data.financial_year_start);
const financialYearOverrideChanged = computed(() => props.previous && jsonRepresentationIsDifferent(props.previous.financial_year_override, props.data.financial_year_override));
const proceedingsUrlsChanged = computed(() => props.previous && jsonRepresentationIsDifferent(props.previous.proceedings_urls, props.data.proceedings_urls));
const annotationChanged = computed(() => props.previous && props.previous.annotation !== props.data.annotation);
const activeChanged = computed(() => props.previous && props.previous.active !== props.data.active);

</script>

<template>
  <div class="box has-background-warning-light">
    <h4>Stand von:
      <TS :ts="data.timestamp"/>
      ({{ data.user }})
    </h4>
    <button class="button is-small" @click="restore">
      Wiederherstellen
    </button>

    <dl>
      <dt>ID</dt>
      <dd :class="fsIdChanged ? 'has-background-warning':''">
        <template v-if="!fsIdChanged">
          {{ data.fs_id }}
        </template>
        <template v-else>
          <del>{{ previous?.fs_id }}</del>
          <br>
          <b>{{ data.fs_id }}</b>
        </template>
      </dd>

      <dt>Name</dt>
      <dd :class="nameChanged ? 'has-background-warning':''">
        <template v-if="!nameChanged">
          {{ data.name }}
        </template>
        <template v-else>
          <del>{{ previous?.name }}</del>
          <br>
          <b>{{ data.name }}</b>
        </template>
      </dd>

      <dt>Fachschaftssatzung</dt>
      <dd :class="statutesChanged ? 'has-background-warning':''">
        <template v-if="!statutesChanged">
          <a :href="data.statutes">{{ data.statutes }}</a>
        </template>
        <template v-else>
          <del>{{ previous?.statutes }}</del>
          <br>
          <a :href="data.statutes"><b>{{ data.statutes }}</b></a>
        </template>
      </dd>

      <dt>Beginn des Haushaltsjahres</dt>
      <dd :class="financialYearStartChanged ? 'has-background-warning':''">
        <template v-if="!financialYearStartChanged">
          {{ data.financial_year_start }}
        </template>
        <template v-else>
          <del>{{ previous?.financial_year_start }}</del>
          <br>
          <b>{{ data.financial_year_start }}</b>
        </template>
      </dd>

      <dt>Abweichende Haushaltsjahre</dt>
      <dd :class="financialYearOverrideChanged ? 'has-background-warning':''">
        <template v-if="!financialYearOverrideChanged">
          {{ data.financial_year_override }}
        </template>
        <template v-else>
          <del>{{ previous?.financial_year_override }}</del>
          <br>
          <b>{{ data.financial_year_override }}</b>
        </template>
      </dd>

      <dt>Sitzungsprotokoll-URLs</dt>
      <dd :class="proceedingsUrlsChanged ? 'has-background-warning':''">
        <template v-if="!proceedingsUrlsChanged">
          {{ data.proceedings_urls }}
        </template>
        <template v-else>
          <del>{{ previous?.proceedings_urls }}</del>
          <br>
          <b>{{ data.proceedings_urls }}</b>
        </template>
      </dd>

      <dt>Anmerkung</dt>
      <dd :class="annotationChanged ? 'has-background-warning':''">
        <template v-if="!annotationChanged">
          {{ data.annotation }}
        </template>
        <template v-else>
          <del>{{ previous?.annotation }}</del>
          <br>
          <b>{{ data.annotation }}</b>
        </template>
      </dd>

      <dt>Aktiv</dt>
      <dd :class="activeChanged ? 'has-background-warning':''">
        <template v-if="!activeChanged">
          {{ data.active }}
        </template>
        <template v-else>
          <del>{{ previous?.active }}</del>
          <br>
          <b>{{ data.active }}</b>
        </template>
      </dd>

      <dt>Bestätigt?</dt>
      <dd>
        <template v-if="data.approved">
          Bestätigt von {{ data.approved_by }}: {{ data.approval_timestamp }}
        </template>
        <template v-else>
          <template v-if="message">
            {{ message }}
          </template>
          <template v-else>
            <button class="button is-small" @click="approve">
              Bestätigen
            </button>
          </template>
        </template>
      </dd>
    </dl>
  </div>
</template>

<style scoped>

</style>