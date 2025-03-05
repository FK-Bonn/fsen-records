<script setup lang="ts">
import {onBeforeMount, type Ref, ref} from "vue";
import {loadFundsIndex, updatePageTitle} from "@/util";
import type {IFundsDistributions} from "@/interfaces";
import FundsForDate from "@/components/funds/FundsForDate.vue";

const funds: Ref<null | IFundsDistributions> = ref(null);
const totalValue: Ref<number> = ref(60_000);
const baseValue: Ref<number> = ref(1000);

const loadFunds = () => {
  loadFundsIndex().then(value => funds.value = value);
};
onBeforeMount(() => {
  updatePageTitle('AFSG-Verteilung');
  loadFunds();
});
</script>

<template>
  <div class="container section">
    <h1 class="title is-1">AFSG-Verteilung</h1>

    <p class="mb-5">
      Die Verteilung der AFSG auf die Fachschaften anhand der studierten
      Fach-Abschluss-Kombinationen wird fortlaufend ermittelt.<br>
      Auf dieser Seite lässt sich ein Stichtag auswählen, für den die Berechnung dargestellt werden soll.
    </p>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Gesamtbetrag</label>
      </div>
      <div class="field-body">
        <div class="field has-addons">
          <p class="control">
            <input class="input" v-model="totalValue" type="number"/>
          </p>
          <p class="control">
            <a class="button is-static">
              €
            </a>
          </p>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Sockelbetrag</label>
      </div>
      <div class="field-body">
        <div class="field has-addons">
          <p class="control">
            <input class="input" v-model="baseValue" type="number"/>
          </p>
          <p class="control">
            <a class="button is-static">
              €
            </a>
          </p>
        </div>
      </div>
    </div>

    <div class="content">
      <template v-for="(values, date) in funds" :key="date">
        <details>
          <summary>{{ date }}</summary>
          <FundsForDate :values="values" :totalValue="totalValue" :baseValue="baseValue" />
        </details>
      </template>
    </div>
  </div>
</template>

<style scoped>
summary {
  cursor: pointer;
}
</style>