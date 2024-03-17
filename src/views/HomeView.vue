<script setup lang="ts">
import TopLegend from "@/components/TopLegend.vue";
import {useStudentBodiesStore} from "@/stores/studentBodies";
import {useScieboDataStore} from "@/stores/scieboData";
import StudentBody from "@/components/studentbody/StudentBody.vue";
import {computed, ref} from "vue";
import {AnnotationLevel} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";

const studentBodies = useStudentBodiesStore();
const sciebo = useScieboDataStore();


const lastUpdate = computed(() => sciebo.data && new Date(sciebo.data.timestamp * 1000).toLocaleString());
const lastUpdateLevel = computed(() => {
  if (!sciebo.data) {
    return AnnotationLevel.Unchecked;
  }
  return (Date.now() / 1000 - sciebo.data.timestamp) > 3600 ? AnnotationLevel.Warning : AnnotationLevel.Ok;
});
</script>

<template>
  <div class="section">
    <div class="message is-info">
      <div class="message-body">
        <p class="is-pulled-right">Letzte Aktualisierung:
          <IconForLevel :level="lastUpdateLevel"/>
          {{ lastUpdate }}
        </p>

        <TopLegend/>
        <!--<Filters/>-->
      </div>
    </div>

    <h2 class="title">sciebo</h2>
    <ul>
      <li v-for="[key, value] in sciebo.data?.studentBodies" :key="key">
        <StudentBody :studentBody="value"/>
      </li>
    </ul>

    <h2 class="title">studentbodies</h2>
    <ul>
      <li v-for="sb in studentBodies.studentBodies" :key="sb">{{ sb }}</li>
    </ul>

  </div>
</template>
