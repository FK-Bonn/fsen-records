<script setup lang="ts">
import type {IStudentBody} from "@/interfaces";
import IconWarning from "@/components/icons/IconWarning.vue";
import FsDataSection from "@/components/fsdata/FsDataSection.vue";
import {computed, ref} from "vue";
import {CurrentlyCanBePaidCalculator, Interval} from "@/Calculator";
import CurrentlyCanBePaidSection from "@/components/studentbody/CurrentlyCanBePaidSection.vue";
import SemesterSection from "@/components/studentbody/SemesterSection.vue";
import {useScieboDataStore} from "@/stores/scieboData";
import DateRange from "@/components/DateRange.vue";
import BfsgSection from "@/components/studentbody/BfsgSection.vue";
import DocumentsSection from "@/components/studentbody/DocumentsSection.vue";
import IconPeople from "@/components/icons/IconPeople.vue";
import {usePageSettingsStore} from "@/stores/pageSettings";
import CompactStudentBody from "@/components/studentbody/CompactStudentBody.vue";
import {useFixedDateStore} from "@/stores/fixedDate";
import {useDocumentsStore} from "@/stores/documents";

const props = defineProps<{
  studentBody: IStudentBody,
}>()

const sciebo = useScieboDataStore();
const settings = usePageSettingsStore();
const fixedDate = useFixedDateStore();
const documents = useDocumentsStore();

const calculator = computed(() => new CurrentlyCanBePaidCalculator(props.studentBody, fixedDate.date, documents.data));
const semesters = computed(() => sciebo.data?.semesters.map(value => Interval.fromStrings(value.start, value.end)))

</script>

<template>
  <template v-if="settings.compactMode">
    <CompactStudentBody :studentBody="studentBody"/>
  </template>
  <template v-else>
    <li class="full-student-body">
      <div class="box">
        <h2 class="title is-2" :id="studentBody.id">
          <a :href="'#'+studentBody.id">
            <IconPeople/>
          </a>
          {{ studentBody.name }}
        </h2>

        <div class="box">
          <template v-if="studentBody.statutes.startsWith('https://')">
            <a :href="studentBody.statutes">Fachschaftssatzung</a> ·
          </template>
          <template v-else>
            <span class="has-text-danger">{studentBody.statutes}</span><br/>
          </template>
          Beginn des Haushaltsjahrs: {{ studentBody.financialYearStart }}
          <span v-if="studentBody.financialYearAnnotation" class="has-text-danger">
          {{ studentBody.financialYearAnnotation }}
        </span>
          <br>
          Aktuelles Haushaltsjahr:
          <DateRange :interval="calculator.getCurrentFinancialYear()"/>
          <IconWarning
              v-if="(calculator.getCurrentFinancialYear()?.end || new Date()) < (fixedDate.date ? new Date(fixedDate.date) : new Date())"/>
          <br>
          Vergangenes Haushaltsjahr:
          <DateRange :interval="calculator.getPreviousFinancialYear()"/>
          <br>
          Sitzungsprotokolle:
          <template v-if="typeof studentBody.proceedingsUrl === 'string'">
            <a :href="studentBody.proceedingsUrl">{{ studentBody.proceedingsUrl }}</a>
          </template>
          <template v-else-if="!studentBody.proceedingsUrl">
            <span class="has-text-warning">Unbekannt!</span><br/>
          </template>
          <template v-else-if="studentBody.proceedingsUrl.length === 1">
            <a :href="studentBody.proceedingsUrl[0].url">{{ studentBody.proceedingsUrl[0].url }}</a>
            ({{ studentBody.proceedingsUrl[0].annotation }})
          </template>
          <template v-else>
            <ul>
              <li v-for="url of studentBody.proceedingsUrl" :key="url.url">
                <a :href="url.url">{{ url.url }}</a> ({{ url.annotation }})
              </li>
            </ul>
          </template>

          <FsDataSection v-if="settings.displayFsData" :studentBody="studentBody"/>
        </div>

        <CurrentlyCanBePaidSection :studentBody="studentBody"/>

        <SemesterSection v-for="semester in semesters" :semester="semester" :studentBody="studentBody"
                         :key="semester?.start.toString()"/>

        <BfsgSection :studentBody="studentBody"/>

        <DocumentsSection :studentBody="studentBody"/>

      </div>
    </li>
  </template>
</template>

<style scoped>
.full-student-body .box {
  margin-bottom: 1rem;
}

.column {
  padding: 0;
}

ul {
  list-style-type: square;
  margin-left: 2rem;
}
</style>