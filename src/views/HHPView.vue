<script setup lang="ts">
import {computed, ref} from "vue";
import type {IHHPItem} from "@/interfaces";
import HhpRender from "@/components/hhp/HHPRender.vue";

const pastedText = ref('');
const parsedHHP = computed(() => {
  if (pastedText.value === '') {
    return null
  }
  const lines = pastedText.value.split('\n');
  let earningRows: (string)[][] = [];
  let expenseRows: (string)[][] = [];
  for (const line of lines) {
    const items = line.split('\t');
    earningRows.push(items.slice(0, 5));
    expenseRows.push(items.slice(-5));
  }
  const earningColumnTitles = earningRows[0].slice(2);
  const expenseColumnTitles = expenseRows[0].slice(2);
  earningRows = earningRows.filter(row => row[0] != '');
  expenseRows = expenseRows.filter(row => row[0] != '');
  const parsedEarningRows = earningRows.map(row => ({
    nr: parseHHPNumber(row[0]),
    text: row[1],
    centValues: [parseCentsAmount(row[2]), parseCentsAmount(row[3]), parseCentsAmount(row[4])],
  })).sort(sortByNr);
  const parsedExpenseRows = expenseRows.map(row => ({
    nr: parseHHPNumber(row[0]),
    text: row[1],
    centValues: [parseCentsAmount(row[2]), parseCentsAmount(row[3]), parseCentsAmount(row[4])],
  })).sort(sortByNr);
  const earnings = {
    columnTitles: earningColumnTitles,
    items: parsedEarningRows,
  }
  const expenses = {
    columnTitles: expenseColumnTitles,
    items: parsedExpenseRows,
  }
  return {
    title: 'Haushaltsplan der Fachschaft Metaphysik/Astrologie',
    financialYearTitle: '2025/26',
    financialYearStart: '2025-10-01',
    financialYearEnd: '2026-09-30',
    financialYearStatutesLocation: '§ 20 Absatz 3 der Fachschaftssatzung',
    passedCommittee: 'Fachschaftsvertretung',
    passedDate: '2025-09-15',
    annotations: [
      'Ausgabentitel mit zwei gleichen Anfangsziffern sind untereinander deckungsfähig, das heißt Minderausgaben in einem Titel ermöglichen Mehrausgaben in einem anderen Titel in derselben Höhe.',
      'Außerdem sind Titel 2.2.1 und 2.5.1. deckungsgleich.',
      'Die Titel 1.3 und 2.3, 1.4 und 2.4, 1.5 und 2.5, 1.6 und 2.6, 1.7 und 2.7, 1.8 und 2.8, 1.8.1 und 2.1.8 sind miteinander gekoppelt, das heißt Mehreinnahmen in einem Titel ermöglichen Mehrausgaben im anderen Titel.',
    ],
    earnings: earnings,
    expenses: expenses,
  };
})

const sortByNr = (a: IHHPItem, b: IHHPItem) => {
  const len = Math.min(a.nr.length, b.nr.length);
  for (let i = 0; i < len; i++) {
    if (a.nr[i] !== b.nr[i]) {
      return a.nr[i] - b.nr[i];
    }
  }
  return a.nr.length - b.nr.length;
}

const parseCentsAmount = (amount: string) => {
  if (amount === '') {
    return null;
  }
  amount = amount.replace(/[€ ]/g, '');
  const commaIndex = amount.lastIndexOf(',');
  const dotIndex = amount.lastIndexOf('.');
  if (commaIndex < dotIndex) {
    amount = amount.replace(/,/g, '');
    return Math.floor(parseFloat(amount) * 100)
  }
  if (dotIndex < commaIndex) {
    amount = amount.replace(/\./g, '');
    amount = amount.replace(/,/g, '.');
    return Math.round(parseFloat(amount) * 100)
  }
  return parseInt(amount) * 100;
}

const parseHHPNumber = (value: string) => {
  value = value.replace(/\./g, ' ');
  value = value.trim();
  const items = value.split(' ');
  return items.map(x => parseInt(x));
}

const yoink = () => {
  navigator.clipboard.readText().then(value => {
    pastedText.value = value;
  })
}

const dl = () => {
  const data = JSON.stringify(parsedHHP.value);
  downloadText(data);
}

const downloadText = (text: string) => {
  const hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(text);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'hhp.json';
  hiddenElement.click();
}

</script>

<template>
  <div class="container section">

    <h1 class="title is-1">Haushaltsplan</h1>

    <button class="button is-primary" @click="yoink">HHP aus Zwischenablage einfügen</button>
    <button class="button is-primary" @click="dl">HHP als JSON herunterladen</button>

    <hr>

    <HhpRender :data="parsedHHP" v-if="parsedHHP"/>

  </div>
</template>

<style scoped>

</style>