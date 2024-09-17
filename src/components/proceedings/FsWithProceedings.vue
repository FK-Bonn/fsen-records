<script setup lang="ts">
import type {IProceedings} from "@/interfaces";
import IconPeople from "@/components/icons/IconPeople.vue";
import {useAccountStore} from "@/stores/account";
import {committeeToFullName, deleteProceedings, hasFsPermission} from "@/util";
import {computed} from "vue";
import UploadForm from "@/components/proceedings/UploadForm.vue";
import {useTokenStore} from "@/stores/token";
import ProceedingsLine from "@/components/proceedings/ProceedingsLine.vue";

const props = defineProps<{
  fs: string,
  name: string,
  proceedings: IProceedings[],
}>()

const emit = defineEmits<{
  reloadProceedings: []
}>()

const account = useAccountStore();
const token = useTokenStore();

const deleteTheseProceedings = (item: IProceedings) => {
  const result = confirm(`Soll Prot-${item.committee}-${item.date}.pdf wirklich gelöscht werden?`);
  if (result) {
    deleteProceedings(props.fs, item.committee, item.date, token.apiToken).then(() => emit('reloadProceedings'));
  }
}

const hasUploadPermission = computed(() => account.user?.admin || hasFsPermission(account.user?.permissions, props.fs, 'upload_proceedings'));
const hasDeletePermission = computed(() => account.user?.admin || hasFsPermission(account.user?.permissions, props.fs, 'delete_proceedings'));
const proceedingsByType = computed(() => {
  const mapped = new Map();
  for (const proceeding of props.proceedings) {
    if (!mapped.has(proceeding.committee)) {
      mapped.set(proceeding.committee, []);
    }
    mapped.get(proceeding.committee).push(proceeding);
  }
  return mapped;
});

</script>

<template>
  <h3 :id="props.fs" class="title is-3">
    <a :href="'#'+props.fs">
      <IconPeople/>
    </a>
    {{ props.name }}
  </h3>

  <template v-if="hasUploadPermission">
    <UploadForm :fs="props.fs" @reload-proceedings="()=>emit('reloadProceedings')"/>
  </template>

  <div class="content">
    <div class="notification is-info is-light" v-if="proceedings.length === 0">
      Keine Protokolle vorhanden.
    </div>
    <template v-else>
      <template v-for="committee in proceedingsByType.keys()" :key="committee">
        <h4 class="title is-4">{{ committeeToFullName(committee) }}</h4>
        <ul>
          <li v-for="item in proceedingsByType.get(committee)" :key="item.sha256hash">
            <ProceedingsLine :item="item" :fs="props.fs"/>

            <button class="button is-light is-outlined is-small is-danger" v-if="hasDeletePermission"
                    @click="()=>deleteTheseProceedings(item)">Protokoll löschen
            </button>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<style scoped>
button {
  margin-left: 1rem;
}
</style>
