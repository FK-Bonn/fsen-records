<script setup lang="ts">
import type {IBaseFsData} from "@/interfaces";
import {computed} from "vue";
import {CurrentlyCanBePaidCalculator, Interval, SemesterCalculator} from "@/Calculator";
import IconPeople from "@/components/icons/IconPeople.vue";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import {calculateSemesterId} from "@/util";
import {useFixedDateStore} from "@/stores/fixedDate";
import {useDocumentsStore} from "@/stores/documents";
import {META} from "@/meta";

const props = defineProps<{
  baseData: IBaseFsData,
}>()

const fixedDate = useFixedDateStore();
const documents = useDocumentsStore();

const calculator = computed(() => new CurrentlyCanBePaidCalculator(props.baseData, fixedDate.date, documents.data));
const semesters = computed(() => META.semesters.map(value => Interval.fromStrings(value.start, value.end)))

</script>

<template>
  <li>
    <div class="box">
      <div class="columns">
        <div class="column">
          <h2 class="title is-5" :id="baseData.fs_id">
            <a :href="'#'+baseData.fs_id">
              <IconPeople/>
            </a>
            {{ baseData.name }}
          </h2>
        </div>
        <div class="column is-narrow">
          <IconForLevel :level="calculator.calculateOverallLevel()" title="Auszahlungsfähigkeit"/>
          |
          <template v-for="semester in semesters" :key="semester?.start">
            <IconForLevel v-if="semester"
                          :level="new SemesterCalculator(baseData, semester, documents.data).calculateOverallLevel()"
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