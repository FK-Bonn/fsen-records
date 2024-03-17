<script setup lang="ts">
import {computed, type Ref, ref} from "vue";
import {useAllFsData} from "@/stores/allFsData";
import type {IEmailAddress, IFsDataHistoryEntry, IProtectedFsDataHistoryEntry} from "@/interfaces";
import {
  approveFsData,
  approveProtectedFsData,
  getFsData,
  getProtectedFsData,
  putFsData,
  putProtectedFsData
} from "@/util";
import {useTokenStore} from "@/stores/token";
import TS from "@/components/TS.vue";

const show = defineModel<boolean>({required: true});
const props = defineProps<{
  data: IProtectedFsDataHistoryEntry,
  previous: IProtectedFsDataHistoryEntry | null,
  fs: string,
}>();

const token = useTokenStore();
const allFsData = useAllFsData();

const message: Ref<string | null> = ref(null);
const loadProtectedFsData = () => {
  getProtectedFsData(props.fs, token.apiToken).then(data => {
    if (allFsData.data && data) {
      allFsData.data[props.fs].protected_data = data;
    }
  });
}

const approve = () => {
  approveProtectedFsData(props.data.id, token.apiToken).then(value => {
    message.value = value?.message || null;
    loadProtectedFsData();
  })
}

const restore = () => {
  putProtectedFsData(props.fs, props.data, token.apiToken).then(() => {
    loadProtectedFsData();
    show.value = false;
  }).catch(() => alert('Speichern fehlgeschlagen.'));
}
const ibanChanged = computed(() => props.previous && props.previous?.iban !== props.data.iban);
const bicChanged = computed(() => props.previous && props.previous?.bic !== props.data.bic);

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
      <dt>IBAN</dt>
      <dd :class="ibanChanged ? 'has-background-warning':''">
        <template v-if="!ibanChanged">
          {{ data.iban }}
        </template>
        <template v-else>
          <del>{{ previous?.iban }}</del>
          <br>
          <b>{{ data.iban }}</b>
        </template>
      </dd>
      <dt>BIC</dt>
      <dd :class="bicChanged ? 'has-background-warning':''">
        <template v-if="!bicChanged">
          {{ data.bic }}
        </template>
        <template v-else>
          <del>{{ previous?.bic }}</del>
          <br>
          <b>{{ data.bic }}</b>
        </template>
      </dd>
    </dl>
    <table class="table table-sm is-bordered">
      <thead>
      <tr>
        <th>E-Mail-Adresse</th>
        <th>kontakt</th>
        <th>fsl</th>
        <th>finanzen</th>
      </tr>
      </thead>
      <tbody>
      <template v-for="email_address in props.data.email_addresses" :key="email_address.address">
        <template
            v-if="!previous || previous.email_addresses.some((value:IEmailAddress) => JSON.stringify(value) === JSON.stringify(email_address))">
          <tr>
            <th>{{ email_address.address }}</th>
            <template v-for="usage in ['kontakt', 'fsl', 'finanzen']" :key="usage">
              <td>{{ email_address.usages.includes(usage) ? '✔️' : '❌' }}</td>
            </template>
          </tr>
        </template>
        <template
            v-else-if="previous && previous.email_addresses.some((value:IEmailAddress) => value.address === email_address.address)">
          <tr class="has-background-warning">
            <th>{{ email_address.address }}</th>
            <template v-for="usage in ['kontakt', 'fsl', 'finanzen']" :key="usage">
              <td>{{
                  previous.email_addresses.find((value: IEmailAddress) => value.address === email_address.address)?.usages.includes(usage)
                      ?
                      '✔️' : '❌'
                }}
                → {{ email_address.usages.includes(usage) ? '✔️' : '❌' }}
              </td>
            </template>
          </tr>
        </template>
        <template v-else>
          <tr class="has-background-success">
            <th>{{ email_address.address }}</th>
            <template v-for="usage in ['kontakt', 'fsl', 'finanzen']" :key="usage">
              <td>{{ email_address.usages.includes(usage) ? '✔️' : '❌' }}</td>
            </template>
          </tr>
        </template>
      </template>
      <template v-if="previous">
        <template v-for="email_address in previous.email_addresses" :key="email_address.address">
          <template
              v-if="!data.email_addresses.some((value: IEmailAddress) => value.address === email_address.address)">
            <tr class="has-background-danger">
              <th>
                <del>{{ email_address.address }}</del>
              </th>
              <template v-for="usage in ['kontakt', 'fsl', 'finanzen']" :key="usage">
                <td>{{ email_address.usages.includes(usage) ? '✔️' : '❌' }}</td>
              </template>
            </tr>
          </template>
        </template>
      </template>
      </tbody>
    </table>
    <dl>
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
dt {
  font-weight: bold;
}

table {
  background-color: rgba(0, 0, 0, 0);
  width: auto;
}

summary {
  font-weight: bold;
  cursor: pointer;
}

details[open] > summary:first-of-type {
  margin-bottom: 1em;
}
</style>