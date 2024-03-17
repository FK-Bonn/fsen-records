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

const props = defineProps<{
  studentBody: IStudentBody,
}>()

const sciebo = useScieboDataStore();

const fixedDate = ref(null);

const calculator = computed(() => new CurrentlyCanBePaidCalculator(props.studentBody, fixedDate.value));
const semesters = computed(() => sciebo.data?.semesters.map(value => Interval.fromStrings(value.start, value.end)))

</script>

<template>
  <li>
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
        <IconWarning v-if="calculator.getCurrentFinancialYear().end < (fixedDate ? new Date(fixedDate) : new Date())"/>
        <br>
        Vergangenes Haushaltsjahr:
        <DateRange :interval="calculator.getPreviousFinancialYear()"/>

        <FsDataSection :studentBody="studentBody"/>
      </div>

      <CurrentlyCanBePaidSection :studentBody="studentBody"/>

      <SemesterSection v-for="semester in semesters" :semester="semester" :studentBody="studentBody"
                       :key="semester?.start.toString()"/>

      <BfsgSection :studentBody="studentBody"/>

      <DocumentsSection :studentBody="studentBody"/>

    </div>
  </li>
</template>

<style scoped>
.box {
  margin-bottom: 1rem;
}
</style>