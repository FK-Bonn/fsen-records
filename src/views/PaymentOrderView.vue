<script setup lang="ts">
import {computed, onBeforeMount} from "vue";
import FixedDateBanner from "@/components/FixedDateBanner.vue";
import {euroCents, parseCommentFields, saveCSV, updatePageTitle} from "@/util";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {AnnotationLevel, type INewPayoutRequestData} from "@/interfaces";
import {useFixedDateStore} from "@/stores/fixedDate";
import {useDocumentsStore} from "@/stores/documents";
import {CurrentlyCanBePaidCalculator} from "@/Calculator";
import {useAllFsData} from "@/stores/allFsData";
import {META} from "@/meta";

onBeforeMount(() => {
  updatePageTitle('Anweisung');
});

const fixedDate = useFixedDateStore();
const documents = useDocumentsStore();
const payoutRequests = usePayoutRequestStore();
const allFsData = useAllFsData();

const getIban = (fsId: string) => {
  if (allFsData.data && Object.prototype.hasOwnProperty.call(allFsData.data, fsId)) {
    const fsData = allFsData.data[fsId];
    if (fsData.protected) {
      if (fsData.protected.is_latest) {
        return fsData.protected.data.iban;
      } else {
        return 'DIE INTERNEN DATEN WURDEN MODIFIZIERT, BITTE PRÜFEN, GGF BESTÄTIGEN, DANN NEU KOPIEREN';
      }
    }
  }
  return 'IBAN';
}
const getBIC = (fsId: string) => {
  if (allFsData.data && Object.prototype.hasOwnProperty.call(allFsData.data, fsId)) {
    const fsData = allFsData.data[fsId];
    if (fsData.protected) {
      if (fsData.protected.is_latest) {
        return fsData.protected.data.bic;
      } else {
        return 'DIE INTERNEN DATEN WURDEN MODIFIZIERT, BITTE PRÜFEN, GGF BESTÄTIGEN, DANN NEU KOPIEREN';
      }
    }
  }
  return 'BIC';
}
const getFsName = (fsId: string) => {
  if (allFsData.data && Object.prototype.hasOwnProperty.call(allFsData.data, fsId)) {
    const fsData = allFsData.data[fsId];
    if (fsData.base) {
      if (fsData.base.is_latest) {
        return fsData.base.data.name;
      } else {
        return 'DIE BASISDATEN WURDEN MODIFIZIERT, BITTE PRÜFEN, GGF BESTÄTIGEN, DANN NEU KOPIEREN';
      }
    }
  }
  return '???';
}

const fsenThatCanBePaid = computed(() => {
  const eligibleFsen: string[] = [];
  if (!allFsData.data) {
    return [];
  }
  for (const fsId in allFsData.data) {
    const baseData = allFsData.data[fsId].base;
    if (!baseData) {
      continue;
    }
    const calculator = new CurrentlyCanBePaidCalculator(baseData.data, fixedDate.date, documents.data);
    if ([AnnotationLevel.Ok, AnnotationLevel.Warning, AnnotationLevel.Info].includes(calculator.calculateOverallLevel())) {
      eligibleFsen.push(fsId);
    }
  }
  return eligibleFsen;

})

const afsg = computed(() => {
  const includedRequests: INewPayoutRequestData[] = [];
  if (!payoutRequests.afsg) {
    return includedRequests;
  }
  for (const fsId of fsenThatCanBePaid.value) {
    const payoutRequestsForFs = payoutRequests.afsg.get(fsId) || []
    includedRequests.push(...payoutRequestsForFs.filter(payoutRequest => payoutRequest.status == 'VOLLSTÄNDIG'))
  }
  return includedRequests;
})

const afsg1 = computed(() => afsg.value.filter(value => (META.budgetTitles[value.semester] || '?').startsWith('3.5.1')))
const afsg2 = computed(() => afsg.value.filter(value => !(META.budgetTitles[value.semester] || '?').startsWith('3.5.1')))

const bfsg = computed(() => {
  const includedRequests: INewPayoutRequestData[] = [];
  if (!payoutRequests.bfsg) {
    return includedRequests;
  }
  for (const fsId of fsenThatCanBePaid.value) {
    const payoutRequestsForFs = payoutRequests.bfsg.get(fsId) || []
    includedRequests.push(...payoutRequestsForFs.filter(payoutRequest => payoutRequest.status == 'ANGENOMMEN'))
  }
  return includedRequests;
})

const formatEuroCentsForExport = (value: number | undefined): string => {
  if (value === undefined) {
    return '';
  }
  const formatter = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });

  return formatter.format(value / 100);
}

const toLineAFSG = (payoutRequest: INewPayoutRequestData) => {
  const recipient = ('Fachschaft ' + getFsName(payoutRequest.fs)).substring(0, 35);
  const iban = getIban(payoutRequest.fs);
  const bic = getBIC(payoutRequest.fs);
  const amount = formatEuroCentsForExport(payoutRequest.amount_cents);
  const text1 = 'Antrag ' + payoutRequest.request_id;
  const text2 = 'vom ' + payoutRequest.request_date;
  const text3 = '';
  const type_ = 'CCS';
  return [recipient, iban, bic, amount, text1, text2, text3, type_].join(';')
}
const toLineBFSG = (payoutRequest: INewPayoutRequestData) => {
  const commentParsed = parseCommentFields(payoutRequest.comment);
  const recipient = ('Fachschaft ' + getFsName(payoutRequest.fs)).substring(0, 35);
  const iban = getIban(payoutRequest.fs);
  const bic = getBIC(payoutRequest.fs);
  const amount = formatEuroCentsForExport(payoutRequest.amount_cents);
  const text1 = 'Antrag ' + payoutRequest.request_id;
  const text2 = 'abg. ' + payoutRequest.status_date + ' FID ' + commentParsed.fid;
  const text3 = (commentParsed.title || payoutRequest.category).substring(0, 27);
  const type_ = 'CCS';
  return [recipient, iban, bic, amount, text1, text2, text3, type_].join(';')
}
const downloadCSV = () => {
  const lines = ['Begünstigter;IBAN des Begünstigten;BIC des Begünstigten;Betrag;Verwendungszweckzeile 1;Verwendungszweckzeile 2;Verwendungszweckzeile 3;Art'];
  for (const payoutRequest of afsg.value) {
    lines.push(toLineAFSG(payoutRequest));
  }
  for (const payoutRequest of bfsg.value) {
    lines.push(toLineBFSG(payoutRequest));
  }
  const today = fixedDate.date ? fixedDate.date : (new Date()).toISOString().substring(0, 10);
  saveCSV(lines.join('\n'), 'anweisung-fsen-' + today + '.csv');
}
</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">Anweisung</h1>


    <div class="content">
      <p>
        <button class="button is-primary" @click="downloadCSV">CSV-Export für Kasse herunterladen</button>
      </p>

      <p>Copy-paste ↓</p>
      <hr>
      <p>Aus dem Haushaltstitel 3.5.1 (Allgemeine FS-Gelder (beantragbar)), nach §18 (4) der FSFS (01.07.2025),
        erhält:</p>

      <table class="table is-striped is-bordered is-fullwidth">
        <thead>
        <tr>
          <th>Nr.</th>
          <th>Haushaltstitel</th>
          <th>Fachschaft</th>
          <th>Antragsnr.</th>
          <th>Antrag gestellt</th>
          <th>Betrag in Euro</th>
          <th>IBAN</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(x, index) in afsg1" :key="x.request_id">
          <td>{{ index + 1 }}</td>
          <td>{{ META.budgetTitles[x.semester] || '?' }}</td>
          <td>{{ getFsName(x.fs) }}</td>
          <td>{{ x.request_id }}</td>
          <td>{{ x.request_date }}</td>
          <td>{{ euroCents(x.amount_cents).slice(0, -2) }}</td>
          <td>{{ getIban(x.fs) }}</td>
        </tr>
        </tbody>
      </table>

      <p>Aus dem Haushaltstitel 3.5.2 (Allgemeine FS-Gelder (vervollständigbar)), nach §18 (4) der FSFS (01.07.2025),
        erhält:</p>

      <table class="table is-striped is-bordered is-fullwidth">
        <thead>
        <tr>
          <th>Nr.</th>
          <th>Haushaltstitel</th>
          <th>Fachschaft</th>
          <th>Antragsnr.</th>
          <th>Antrag gestellt</th>
          <th>Betrag in Euro</th>
          <th>IBAN</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(x, index) in afsg2" :key="x.request_id">
          <td>{{ index + 1 }}</td>
          <td>{{ META.budgetTitles[x.semester] || '?' }}</td>
          <td>{{getFsName(x.fs) }}</td>
          <td>{{ x.request_id }}</td>
          <td>{{ x.request_date }}</td>
          <td>{{ euroCents(x.amount_cents).slice(0, -2) }}</td>
          <td>{{ getIban(x.fs) }}</td>
        </tr>
        </tbody>
      </table>

      <p>Aus dem Haushaltstitel 3.5.3 (Besondere FS-Gelder), nach §21 (2) der FSFS (01.07.2025), erhält:</p>

      <table class="table is-striped is-bordered is-fullwidth">
        <thead>
        <tr>
          <th>Nr.</th>
          <th>Haushaltstitel</th>
          <th>Fachschaft</th>
          <th>Antragsnr.</th>
          <th>Zweck</th>
          <th>Abgestimmt</th>
          <th>Betrag in Euro</th>
          <th>IBAN</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(x, index) in bfsg" :key="x.request_id">
          <td>{{ index + 1 }}</td>
          <td>{{ META.budgetTitlesBfsg[x.semester] || '?' }}</td>
          <td>{{ getFsName(x.fs) }}</td>
          <td>{{ x.request_id }}</td>
          <td>{{ parseCommentFields(x.comment).title || x.category }}</td>
          <td>{{ x.status_date + ' FID ' + parseCommentFields(x.comment).fid }}</td>
          <td>{{ euroCents(x.amount_cents).slice(0, -2) }}</td>
          <td>{{ getIban(x.fs) }}</td>
        </tr>
        </tbody>
      </table>
      <hr>
      <p>Copy-paste ↑</p>
    </div>
  </div>
</template>

<style scoped>
p {
  margin-bottom: 1rem;
}
</style>
