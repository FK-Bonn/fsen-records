<script setup lang="ts">
import {computed, onBeforeMount, ref} from "vue";
import FixedDateBanner from "@/components/FixedDateBanner.vue";
import {editPayoutRequest, euroCents, parseCommentFields, saveTextAsFile, updatePageTitle} from "@/util";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {AnnotationLevel, type INewPayoutRequestData, type IPaymentOrderLineData} from "@/interfaces";
import {useFixedDateStore} from "@/stores/fixedDate";
import {useDocumentsStore} from "@/stores/documents";
import {CurrentlyCanBePaidCalculator} from "@/Calculator";
import {useAllFsData} from "@/stores/allFsData";
import {META} from "@/meta";
import {useTokenStore} from "@/stores/token";
import SimpleCopyableTag from "@/components/SimpleCopyableTag.vue";

// https://hilfe.starmoney.de/hc/de/articles/360016426753-Import-von-Zahlungsverkehrsauftr%C3%A4gen-in-StarMoney-Business
const MAX_NUMBER_OF_TEXT_LINES = 14;

onBeforeMount(() => {
  updatePageTitle('Anweisung');
});

const fixedDate = useFixedDateStore();
const documents = useDocumentsStore();
const payoutRequests = usePayoutRequestStore();
const allFsData = useAllFsData();
const token = useTokenStore();

const fatFingerCheckboxValue = ref<boolean>(false);
const updateResult = ref<{ request_id: string | null, message: string | null }[]>([]);

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

const afsg1 = computed(() => afsg.value.filter(value => (META.budgetTitles[value.semester] || '?').startsWith('3.9.6')))
const afsg2 = computed(() => afsg.value.filter(value => !(META.budgetTitles[value.semester] || '?').startsWith('3.9.6')))

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

const formatEuroCentsForXml = (value: number | undefined): string => {
  if (value === undefined) {
    return '';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
  return formatter.format(value / 100);
}

const sum = (arr: number[]) => {
  return arr.reduce((acc, element) => acc + element);
}

const toCsvLine = (fsData: IPaymentOrderLineData, textLinesCount: number) => {
  const recipient = ('FS ' + getFsName(fsData.fs)).substring(0, 35);
  const iban = fsData.iban
  const bic = fsData.bic
  const amount = formatEuroCentsForExport(sum(fsData.amounts_cents));
  const textLines = [];
  for (let i = 0; i < textLinesCount; i++) {
    textLines.push('');
  }
  for (let i = 0; i < fsData.request_ids.length; i = i + 2) {
    if (i + 1 === fsData.request_ids.length) {
      textLines[i / 2] = fsData.request_ids[i];
    } else {
      textLines[i / 2] = fsData.request_ids[i] + ' ' + fsData.request_ids[i + 1];
    }
  }
  const type_ = 'CCS';
  return [recipient, iban, bic, amount, ...textLines, type_].join(';')
}

const REPLACEMENTS = [
  ['Ä', 'Ae'],
  ['Ö', 'Oe'],
  ['Ü', 'Ue'],
  ['ä', 'ae'],
  ['ö', 'oe'],
  ['ü', 'ue'],
  ['ẞ', 'SS'],
  ['ß', 'ss'],
]
const replaceUmlauts = (text: string) => {
  return text; // TODO remove this line if replacing umlauts is necessary
  for (const chars of REPLACEMENTS) {
    text = text.replace(RegExp(chars[0], 'g'), chars[1])
  }
  return text;
}

const toXmlSnippet = (fsData: IPaymentOrderLineData) => {
  const recipient = replaceUmlauts('FS ' + getFsName(fsData.fs)).substring(0, 70);
  const iban = fsData.iban.replace(/ /g, '').trim()
  const bic = fsData.bic.replace(/ /g, '').trim()
  const amount = formatEuroCentsForXml(sum(fsData.amounts_cents));
  const uuid = self.crypto.randomUUID().replace(/-/g, '');
  let remittanceInformation = ''
  for (const requestId of fsData.request_ids) {
    const newRemittanceInformation = (remittanceInformation + ' ' + requestId).trim()
    if (newRemittanceInformation.length <= 140) {
      remittanceInformation = newRemittanceInformation;
    } else {
      break;
    }
  }
  return `            <CdtTrfTxInf>
                <PmtId>
                    <EndToEndId>${uuid}</EndToEndId>
                </PmtId>
                <Amt>
                    <InstdAmt Ccy="EUR">${amount}</InstdAmt>
                </Amt>
                <CdtrAgt>
                    <FinInstnId>
                        <BICFI>${bic}</BICFI>
                    </FinInstnId>
                </CdtrAgt>
                <Cdtr>
                    <Nm>${recipient}</Nm>
                </Cdtr>
                <CdtrAcct>
                    <Id>
                        <IBAN>${iban}</IBAN>
                    </Id>
                </CdtrAcct>
                <RmtInf>
                    <Ustrd>${remittanceInformation}</Ustrd>
                </RmtInf>
            </CdtTrfTxInf>
`
}

function collectItemsForFs() {
  const itemsForFs: IPaymentOrderLineData[] = [];
  for (const payoutRequest of [...afsg.value, ...bfsg.value]) {
    let found = false;
    for (const line of itemsForFs) {
      if (line.fs === payoutRequest.fs) {
        line.request_ids.push(payoutRequest.request_id);
        line.amounts_cents.push(payoutRequest.amount_cents);
        found = true;
      }
    }
    if (!found) {
      itemsForFs.push({
        fs: payoutRequest.fs,
        iban: getIban(payoutRequest.fs),
        bic: getBIC(payoutRequest.fs),
        request_ids: [payoutRequest.request_id],
        amounts_cents: [payoutRequest.amount_cents],
      })
    }
  }
  return itemsForFs;
}

function calculateNumberOfTextLines(itemsForFs: IPaymentOrderLineData[]) {
  // request_ids are XXXX-XXXX, we can fit 2 per line of max length 27
  const maxNumberOfRequestIds = Math.max(...itemsForFs.map(value => value.request_ids.length));
  const requiredNumberOfTextLines = Math.ceil(maxNumberOfRequestIds / 2);
  return Math.min(MAX_NUMBER_OF_TEXT_LINES, requiredNumberOfTextLines);
}

const downloadCSV = () => {
  const itemsForFs = collectItemsForFs();
  const textLinesCount = calculateNumberOfTextLines(itemsForFs)
  const textLines = []
  for (let i = 0; i < textLinesCount; i++) {
    textLines.push(`Verwendungszweckzeile ${i + 1}`)
  }
  const firstLineItems = ['Begünstigter', 'IBAN des Begünstigten', 'BIC des Begünstigten', 'Betrag', ...textLines, 'Art'];
  const lines = [firstLineItems.join(';')]
  for (const fsData of itemsForFs) {
    lines.push(toCsvLine(fsData, textLinesCount));
  }
  const today = fixedDate.date ? fixedDate.date : (new Date()).toISOString().substring(0, 10);
  saveTextAsFile(lines.join('\n'), 'anweisung-fsen-' + today + '.csv', 'text/csv');
}

const downloadXML = () => {
  const itemsForFs = collectItemsForFs();
  const paymentSnippets = itemsForFs.map(toXmlSnippet);
  let totalSum = 0;
  for (const fsData of itemsForFs) {
    totalSum += sum(fsData.amounts_cents);
  }
  const formattedTotalSum = formatEuroCentsForXml(totalSum);
  const timestamp = fixedDate.date ? `${fixedDate.date}T00:00:00.000Z` : (new Date()).toISOString();
  const today = timestamp.substring(0, 10);
  const numberOfTransactions = itemsForFs.length
  const uuid1 = self.crypto.randomUUID().replace(/-/g, '');
  const uuid2 = self.crypto.randomUUID().replace(/-/g, '');
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09pain.001.001.09.xsd">
    <CstmrCdtTrfInitn>
        <GrpHdr>
            <MsgId>${uuid1}</MsgId>
            <CreDtTm>${timestamp}</CreDtTm>
            <NbOfTxs>${numberOfTransactions}</NbOfTxs>
            <CtrlSum>${formattedTotalSum}</CtrlSum>
            <InitgPty>
                <Nm>AStA Allgemeiner Studierendenausschuß der Universität Bonn</Nm>
            </InitgPty>
        </GrpHdr>
        <PmtInf>
            <PmtInfId>${uuid2}</PmtInfId>
            <PmtMtd>TRF</PmtMtd>
            <BtchBookg>true</BtchBookg>
            <NbOfTxs>${numberOfTransactions}</NbOfTxs>
            <CtrlSum>${formattedTotalSum}</CtrlSum>
            <PmtTpInf>
                <SvcLvl>
                    <Cd>SEPA</Cd>
                </SvcLvl>
            </PmtTpInf>
            <ReqdExctnDt>
                <Dt>${today}</Dt>
            </ReqdExctnDt>
            <Dbtr>
                <Nm>AStA Allgemeiner Studierendenausschuß der Universität Bonn</Nm>
            </Dbtr>
            <DbtrAcct>
                <Id>
                    <IBAN>DE31370501980000038463</IBAN>
                </Id>
            </DbtrAcct>
            <DbtrAgt>
                <FinInstnId>
                    <BICFI>COLSDE33XXX</BICFI>
                </FinInstnId>
            </DbtrAgt>
            <ChrgBr>SLEV</ChrgBr>
`
  xml += paymentSnippets.join('\n')
  xml += `        </PmtInf>
    </CstmrCdtTrfInitn>
</Document>
`
  saveTextAsFile(xml, 'anweisung-fsen-' + today + '.xml', 'text/xml');
}

const updateAllStatuses = async () => {
  if (!fatFingerCheckboxValue.value) {
    alert('Hast du dicke Finger?');
    return;
  }
  if (updateResult.value.length) {
    alert('Hast du doch schon geklickt? Warum nochmal?');
    return;
  }
  const today = (new Date()).toISOString().substring(0, 10);
  const payload = {status: 'ANGEWIESEN', status_date: today}

  for (const afsgRequest of afsg.value) {
    const result = await editPayoutRequest(afsgRequest.request_id, 'afsg', payload, token.token());
    updateResult.value.push({request_id: afsgRequest.request_id, message: result?.message || null});
  }
  for (const bfsgRequest of bfsg.value) {
    const result = await editPayoutRequest(bfsgRequest.request_id, 'bfsg', payload, token.token());
    updateResult.value.push({request_id: bfsgRequest.request_id, message: result?.message || null});
  }
  updateResult.value.push({request_id: null, message: 'Abgeschlossen.'})
}

</script>

<template>
  <div class="section">
    <FixedDateBanner/>

    <h1 class="title is-1">Anweisung</h1>


    <div class="content">
      <p>
        <button class="button is-primary" @click="downloadXML">XML-Export für Kasse herunterladen</button>
        <br>
        <em>Im XML-Export ist eine Überweisung pro Fachschaft enthalten, bei der die Beträge aller Anträge aufsummiert
          sind.</em>
      </p>
      <p class="is-hidden">
        <button class="button is-primary" @click="downloadCSV">CSV-Export für Kasse herunterladen</button>
        <br>
        <em>Im CSV-Export ist eine Überweisung pro Fachschaft enthalten, bei der die Beträge aller Anträge aufsummiert
          sind.</em>
      </p>

      <p>Copy-paste ↓</p>
      <hr>
      <p>Aus dem Haushaltstitel 3.9.6 (Allgemeine Fachschaftengelder (traditionsreiches Modell)),
        nach § 18 (4) der FSFS (07.06.2026), erhält:</p>

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

      <p>Aus den Haushaltstiteln 3.9.1 bis 3.9.4 (Allgemeine Fachschaftengelder), nach § 18 (4) der FSFS (07.06.2026),
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
          <td>{{ META.budgetTitles[x.semester] || META.afsgBudgetTitles[x.fs] || '?' }}</td>
          <td>{{ getFsName(x.fs) }}</td>
          <td>{{ x.request_id }}</td>
          <td>{{ x.request_date }}</td>
          <td>{{ euroCents(x.amount_cents).slice(0, -2) }}</td>
          <td>{{ getIban(x.fs) }}</td>
        </tr>
        </tbody>
      </table>

      <p>Aus dem Haushaltstitel 3.9.7 (Besondere FS-Gelder), nach § 21 (2) der FSFS (07.06.2026), erhält:</p>

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
          <td>{{ META.bfsgBudgetTitle || '?' }}</td>
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

      <div class="columns" v-if="!fixedDate.date">
        <div class="column is-narrow">
          <button class="button" @click="updateAllStatuses">Alle diese Anträge auf ANGEWIESEN stellen</button>
        </div>
        <div class="column">
        </div>
        <div class="column is-narrow">
          <label class="checkbox" for="fatfinger">
            <input type="checkbox" id="fatfinger" v-model="fatFingerCheckboxValue">
            Ich habe nicht aus Versehen auf den Knopf da drüben gedrückt
          </label>
        </div>
      </div>
      <div>
        <ul>
          <li v-for="(item, i) in updateResult" :key="i">
            <SimpleCopyableTag v-if="item.request_id" :text="item.request_id"/>
            {{ item.message }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
p {
  margin-bottom: 1rem;
}
</style>
