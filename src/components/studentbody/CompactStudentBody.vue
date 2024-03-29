<script setup lang="ts">
import type {IStudentBody} from "@/interfaces";
import {computed, ref} from "vue";
import {CurrentlyCanBePaidCalculator, Interval, SemesterCalculator} from "@/Calculator";
import {useScieboDataStore} from "@/stores/scieboData";
import IconPeople from "@/components/icons/IconPeople.vue";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import {calculateSemesterId} from "@/util";
import {useFixedDateStore} from "@/stores/fixedDate";

const props = defineProps<{
  studentBody: IStudentBody,
}>()

const sciebo = useScieboDataStore();
const fixedDate = useFixedDateStore();

const calculator = computed(() => new CurrentlyCanBePaidCalculator(props.studentBody, fixedDate.date));
const semesters = computed(() => sciebo.data?.semesters.map(value => Interval.fromStrings(value.start, value.end)))

</script>

<template>
  <li>
    <div class="box">
      <div class="columns">
        <div class="column">
          <h2 class="title is-5" :id="studentBody.id">
            <a :href="'#'+studentBody.id">
              <IconPeople/>
            </a>
            {{ studentBody.name }}
          </h2>
        </div>
        <div class="column is-narrow">
          <IconForLevel :level="calculator.calculateOverallLevel()" title="Auszahlungsfähigkeit"/>
          |
          <template v-for="semester in semesters" :key="semester?.start">
            <IconForLevel v-if="semester"
                          :level="new SemesterCalculator(studentBody, semester).calculateOverallLevel()"
                          :title="calculateSemesterId(semester)"/>
          </template>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.column {
  padding: 0;
}
</style>