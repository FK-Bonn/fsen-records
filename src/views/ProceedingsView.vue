<script setup lang="ts">
import {computed, nextTick, onBeforeMount, type Ref, ref, watch} from "vue";
import {loadProceedingsIndex, scrollToHashIfPresent, updatePageTitle} from "@/util";
import type {IProceedings} from "@/interfaces";
import {useScieboDataStore} from "@/stores/scieboData";
import {useAccountStore} from "@/stores/account";
import FsWithProceedings from "@/components/proceedings/FsWithProceedings.vue";

const sciebo = useScieboDataStore();
const account = useAccountStore();
const proceedings: Ref<null | IProceedings[]> = ref(null);

const loadProceedings = () => {
  loadProceedingsIndex().then(value => proceedings.value = value);
};

onBeforeMount(() => {
  updatePageTitle('Sitzungsprotokolle');
  loadProceedings();
});
watch(() => (sciebo.data !== null && proceedings.value !== null), async () => {
  await nextTick();
  scrollToHashIfPresent();
});

const fsen = computed(() => {
  if (account.user?.admin) {
    return [...(sciebo.data?.studentBodies.keys() || [])].sort();
  }
  const fsenWithProceedings = new Set(proceedings.value?.map(value => value.fs));
  const fsenWithUploadRights = new Set(account.user?.permissions.filter(value => value.upload_proceedings).map(value => value.fs));
  return [...(sciebo.data?.studentBodies.keys() || [])].sort().filter(fs => fsenWithProceedings.has(fs) || fsenWithUploadRights.has(fs));
})

const proceedingsByFs = computed(() => {
  const mapping = new Map<string, IProceedings[]>();
  for (const item of proceedings.value || []) {
    if (!mapping.has(item.fs)) {
      mapping.set(item.fs, []);
    }
    mapping.get(item.fs)?.push(item);
  }
  return mapping;
})

</script>

<template>
  <div class="container section">
    <h1 class="title is-1">Sitzungsprotokolle</h1>
    <h2 class="subtitle is-2">der Fachschaften</h2>

    <div class="notification is-info">
      🛈 Diese Sitzungsprotokolle sind nur aus dem Netzwerk der Universität Bonn
      (z. B. per <a href="https://www.hrz.uni-bonn.de/de/services/internet-netzzugang/vpn-bonnet">VPN</a>)
      oder durch angemeldete Nutzer*innen abrufbar.
    </div>

    <template v-for="fs in fsen" :key="fs">
      <FsWithProceedings
          :fs="fs"
          :name="sciebo.data?.studentBodies.get(fs)?.name||''"
          :proceedings="proceedingsByFs.get(fs)||[]"
          @reload-proceedings="()=>loadProceedings()"/>
    </template>
  </div>
</template>
