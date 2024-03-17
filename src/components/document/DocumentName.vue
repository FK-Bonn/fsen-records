<script setup lang="ts">
import type {IAnnotatedDocument, IStudentBody} from "@/interfaces";
import IconForLevel from "@/components/icons/IconForLevel.vue";
import IconQuestionmark from "@/components/icons/IconQuestionmark.vue";
import DateRange from "@/components/DateRange.vue";
import {Interval, VerdictCalculator} from "@/Calculator";
import {computed} from "vue";

const props = defineProps<{
  document: IAnnotatedDocument,
}>()

const getFinancialYearShort = (start: string, end?: string): string => {
  const yearStart = start.substring(0, 4);
  const yearEnd = end?.substring(0, 4);
  return yearStart === yearEnd ? yearStart : yearStart + '/' + yearEnd?.substring(2, 4);
}
const getPrefix = (document: IAnnotatedDocument) => {
  if (document.filename.startsWith('HHP-')) {
    let prefix = 'Haushaltsplan ';
    if (document.filename.includes('-NHHP5')) {
      prefix = '5. Nachtragshaushaltsplan ';
    } else if (document.filename.includes('-NHHP4')) {
      prefix = '4. Nachtragshaushaltsplan ';
    } else if (document.filename.includes('-NHHP3')) {
      prefix = '3. Nachtragshaushaltsplan ';
    } else if (document.filename.includes('-NHHP2')) {
      prefix = '2. Nachtragshaushaltsplan ';
    } else if (document.filename.includes('-NHHP')) {
      prefix = 'Nachtragshaushaltsplan ';
    }
    return prefix + getFinancialYearShort(document.dateStart, document.dateEnd);
  }
  if (document.filename.startsWith('HHR-')) {
    return 'Haushaltsrechnung ' + getFinancialYearShort(document.dateStart, document.dateEnd);
  }
  if (document.filename.startsWith('KP-')) {
    return 'Kassenprüfung über den Zeitraum';
  }
  if (document.filename.startsWith('Wahlergebnis-')) {
    return 'Ergebnis der Wahl vom';
  }
  if (document.filename.startsWith('Prot-')) {
    return 'Protokoll der Sitzung vom';
  }
}
const hasDateInParentheses = (document: IAnnotatedDocument) => {
  if (document.filename.startsWith('HHP-')) {
    return true;
  }
  if (document.filename.startsWith('HHR-')) {
    return true;
  }
  if (document.filename.startsWith('KP-')) {
    return false;
  }
  if (document.filename.startsWith('Wahlergebnis-')) {
    return false;
  }
  if (document.filename.startsWith('Prot-')) {
    return false;
  }
}

const prefix = computed(() => getPrefix(props.document));
const dateInParentheses = computed(() => hasDateInParentheses(props.document));
</script>

<template>
  <template v-if="dateInParentheses">
    {{ prefix }}
    (
    <DateRange :interval="Interval.fromStrings(document.dateStart, document.dateEnd || document.dateStart)"/>
    )
  </template>
  <template v-else>
    {{ prefix }}
    <DateRange :interval="Interval.fromStrings(document.dateStart, document.dateEnd || document.dateStart)"/>
  </template>
</template>

<style scoped>
ul, ul:not(:last-child) {
  list-style: none !important;
  margin-top: .2em !important;
  margin-bottom: .1em;
}
</style>