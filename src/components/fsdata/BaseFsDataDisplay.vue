<script setup lang="ts">

import type {IBaseFsData} from "@/interfaces";
import {computed} from "vue";
import {CurrentlyCanBePaidCalculator} from "@/Calculator";
import {useDocumentsStore} from "@/stores/documents";
import {useFixedDateStore} from "@/stores/fixedDate";
import DateRange from "@/components/DateRange.vue";
import IconInfo from "@/components/icons/IconInfo.vue";
import IconWarning from "@/components/icons/IconWarning.vue";

const props = defineProps<{
  data: IBaseFsData,
}>()

const documents = useDocumentsStore();
const fixedDate = useFixedDateStore();


const calculator = computed(() => new CurrentlyCanBePaidCalculator(props.data, fixedDate.date, documents.data));

</script>

<template>
  <template v-if="data.statutes.startsWith('https://')">
    <a :href="data.statutes">Fachschaftssatzung</a> ·
  </template>
  <template v-else>
    <span class="has-text-danger">{{ data.statutes }}</span><br/>
  </template>
  Beginn des Haushaltsjahrs: {{ data.financial_year_start }}
  <span v-if="data.annotation" class="has-text-danger">
          {{ data.annotation }}
        </span>
  <br>
  Aktuelles Haushaltsjahr:
  <DateRange :interval="calculator.getCurrentFinancialYear()"/>
  <IconWarning
      v-if="(calculator.getCurrentFinancialYear()?.end || new Date()) < (fixedDate.date ? new Date(fixedDate.date) : new Date())"/>
  <IconInfo v-if="data.financial_year_override" title="Dieser Zeitraum wurde manuell überschrieben"/>
  <br>
  Vergangenes Haushaltsjahr:
  <DateRange :interval="calculator.getPreviousFinancialYear()"/>
  <IconInfo v-if="data.financial_year_override" title="Dieser Zeitraum wurde manuell überschrieben"/>
  <br>
  Sitzungsprotokolle:
  <template v-if="data.proceedings_urls.length === 0">
    <span class="has-text-warning">Unbekannt!</span><br/>
  </template>
  <template v-else-if="data.proceedings_urls.length === 1">
    <a :href="data.proceedings_urls[0].url">{{ data.proceedings_urls[0].url }}</a>
    <span v-if="data.proceedings_urls[0].annotation">({{
        data.proceedings_urls[0].annotation
      }})</span>
  </template>
  <template v-else>
    <ul>
      <li v-for="url of data.proceedings_urls" :key="url.url">
        <a :href="url.url">{{ url.url }}</a> <span v-if="url.annotation">({{ url.annotation }})</span>
      </li>
    </ul>
  </template>
</template>

<style scoped>
.content ul {
  margin-top: .2rem;
}
</style>