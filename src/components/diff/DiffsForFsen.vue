<script setup lang="ts">

import IconPeople from "@/components/icons/IconPeople.vue";
import type {
  IAllFsData,
  IAnnotatedDocumentDiff,
  IDocumentDataForFs,
  INewPayoutRequestData,
  IPayoutRequestDiff,
  IStudentBodyDiff
} from "@/interfaces";
import {computed} from "vue";
import PayoutRequestDiff from "@/components/diff/PayoutRequestDiff.vue";
import GenericDiff from "@/components/diff/GenericDiff.vue";
import {isSameReference, jsonRepresentationIsDifferent} from "@/util";
import DocumentDiff from "@/components/diff/DocumentDiff.vue";

const props = defineProps<{
  fsDataStart: null | IAllFsData,
  afsgStart: null | Map<string, INewPayoutRequestData[]>,
  bfsgStart: null | Map<string, INewPayoutRequestData[]>,
  vorankuendigungStart: null | Map<string, INewPayoutRequestData[]>,
  documentsStart: null | IDocumentDataForFs,
  fsDataEnd: null | IAllFsData,
  afsgEnd: null | Map<string, INewPayoutRequestData[]>,
  bfsgEnd: null | Map<string, INewPayoutRequestData[]>,
  vorankuendigungEnd: null | Map<string, INewPayoutRequestData[]>,
  documentsEnd: null | IDocumentDataForFs,
}>();


const isJsonEqual = (first: any, second: any): boolean => {
  return JSON.stringify(first) === JSON.stringify(second);
}


const getModifiedPayoutRequests = (first: Map<string, INewPayoutRequestData[]> | null,
                                   second: Map<string, INewPayoutRequestData[]> | null): IPayoutRequestDiff[] => {
  const modifiedPayoutRequests: IPayoutRequestDiff[] = [];
  if (!first || !second) {
    return modifiedPayoutRequests
  }
  for (let fs of first.keys()) {
    for (let firstData of first.get(fs) || []) {
      if (!second.has(fs)) {
        modifiedPayoutRequests.push({
          fs, semester: firstData.semester, oldPR: firstData, newPR: null,
          type: firstData.type.toUpperCase()
        });
      } else if (!second.get(fs)?.some(value => value.request_id === firstData.request_id)) {
        modifiedPayoutRequests.push({
          fs, semester: firstData.semester, oldPR: firstData, newPR: null,
          type: firstData.type.toUpperCase()
        });
      } else {
        const secondData = second.get(fs)?.find(value => value.request_id === firstData.request_id);
        if (!isJsonEqual(firstData, secondData)) {
          modifiedPayoutRequests.push({
            fs, semester: firstData.semester, oldPR: firstData, newPR: secondData || null,
            type: firstData.type.toUpperCase()
          });
        }
      }
    }
  }
  for (let fs of second.keys()) {
    for (let secondData of second.get(fs) || []) {
      if (!first.has(fs)) {
        modifiedPayoutRequests.push({
          fs, semester: secondData.semester, oldPR: null, newPR: secondData,
          type: secondData.type.toUpperCase()
        });
      } else if (!first.get(fs)?.some(value => value.request_id === secondData.request_id)) {
        modifiedPayoutRequests.push({
          fs, semester: secondData.semester, oldPR: null, newPR: secondData,
          type: secondData.type.toUpperCase()
        });
      }
    }
  }
  return modifiedPayoutRequests;
}

const emptyStudentBodyDiff = (fs: string, name: string | undefined): IStudentBodyDiff => {
  return {
    fs,
    name: name || '?',
    documents: [],
    annotationDiff: null,
    statutesDiff: null,
    modifiedPayoutRequests: [],
    modifiedBfsg: [],
    modifiedVorankuendigung: [],
    financialYearStartDiff: null,
    proceedingsUrlDiff: null,
  };
}

const annotatedDocumentComparator = (first: IAnnotatedDocumentDiff, second: IAnnotatedDocumentDiff) => {
  const firstFilename = first.oldDocument ? first.oldDocument.filename : first.newDocument ? first.newDocument.filename : '';
  const secondFilename = second.oldDocument ? second.oldDocument.filename : second.newDocument ? second.newDocument.filename : '';
  if (firstFilename > secondFilename) {
    return 1;
  } else if (firstFilename < secondFilename) {
    return -1;
  }
  return 0;
}

const getModifiedStudentBodies = (): IStudentBodyDiff[] => {
  const diffs: IStudentBodyDiff[] = [];
  const modifiedAfsg = getModifiedPayoutRequests(props.afsgStart, props.afsgEnd);
  const modifiedBfsg = getModifiedPayoutRequests(props.bfsgStart, props.bfsgEnd);
  const modifiedVorankuendigung = getModifiedPayoutRequests(props.vorankuendigungStart, props.vorankuendigungEnd);
  if (!props.fsDataStart) {
    return diffs;
  }
  for (let fs of Object.keys(props.fsDataStart)) {
    const firstStudentBody = props.fsDataStart[fs];
    const secondStudentBody = props.fsDataEnd?.[fs];
    const diff = emptyStudentBodyDiff(fs, firstStudentBody?.base?.data.name);
    if (!secondStudentBody) {
      diff.name += ' (not found)';
      diffs.push(diff);
      continue;
    }

    if (firstStudentBody && secondStudentBody) {
      if(props.documentsStart && props.documentsEnd) {
        for (let document of (props.documentsStart[fs] || [])) {
          const filename = document.filename;
          let secondDocument = props.documentsEnd[fs].find(value => isSameReference(value, document));
          if (!secondDocument) {
            diff.documents.push({filename, oldDocument: document, newDocument: null});
          } else if (!isJsonEqual(document, secondDocument)) {
            diff.documents.push({filename, oldDocument: document, newDocument: secondDocument});
          }
        }
        for (let document of props.documentsEnd[fs] || []) {
          const filename = document.filename;
          let firstDocument = props.documentsStart[fs].find(value => value.filename === filename);
          if (!firstDocument) {
            diff.documents.push({filename, oldDocument: null, newDocument: document});
          }
        }
        diff.documents.sort(annotatedDocumentComparator);
      }
      for (let modifiedPayoutRequest of modifiedAfsg) {
        if (modifiedPayoutRequest.fs === fs) {
          diff.modifiedPayoutRequests.push(modifiedPayoutRequest);
        }
      }
      for (let item of modifiedBfsg) {
        if (item.fs === fs) {
          diff.modifiedBfsg.push(item);
        }
      }
      for (let item of modifiedVorankuendigung) {
        if (item.fs === fs) {
          diff.modifiedVorankuendigung.push(item);
        }
      }
      if (firstStudentBody.base?.data.annotation !== secondStudentBody.base?.data.annotation) {
        diff.annotationDiff = {
          oldString: firstStudentBody.base?.data.annotation || '',
          newString: secondStudentBody.base?.data.annotation || '',
        };
      }
      if (firstStudentBody.base?.data.statutes !== secondStudentBody.base?.data.statutes) {
        diff.statutesDiff = {
          oldString: firstStudentBody.base?.data.statutes || '',
          newString: secondStudentBody.base?.data.statutes || '',
        };
      }
      if (firstStudentBody.base?.data.financial_year_start !== secondStudentBody.base?.data.financial_year_start) {
        diff.financialYearStartDiff = {
          oldString: firstStudentBody.base?.data.financial_year_start || '',
          newString: secondStudentBody.base?.data.financial_year_start || '',
        };
      }
      if (jsonRepresentationIsDifferent(firstStudentBody.base?.data.proceedings_urls, secondStudentBody.base?.data.proceedings_urls)) {
        diff.proceedingsUrlDiff = {
          oldString: JSON.stringify(firstStudentBody.base?.data.proceedings_urls),
          newString: JSON.stringify(secondStudentBody.base?.data.proceedings_urls),
        };
      }
    }
    if (!isJsonEqual(diff, emptyStudentBodyDiff(fs, firstStudentBody?.base?.data.name))) {
      diffs.push(diff);
    }
  }

  return diffs;
}

const modifiedStudentBodies = computed(() => getModifiedStudentBodies())
</script>

<template>
  <h2 class="title is-2" id="studentBodies">Fachschaften</h2>
  <template v-for="studentBody in modifiedStudentBodies" :key="studentBody.fs">
    <h3 class="title is-3">
      <a :id="studentBody.fs" :href="'#'+studentBody.fs">
        <IconPeople/>
      </a>
      {{ studentBody.name }}
    </h3>
    <table class="table">
      <thead>
      <tr>
        <th>typ</th>
        <th>alt</th>
        <th>neu</th>
      </tr>
      </thead>
      <tbody>
      <template v-for="request in studentBody.modifiedPayoutRequests"
                :key="request.newPR?.request_id||request.oldPR?.request_id">
        <tr>
          <td>{{ request.type }}<br>{{ request.semester }}</td>
          <PayoutRequestDiff :before="request.oldPR" :after="request.newPR"/>
        </tr>
      </template>
      <template v-for="request in studentBody.modifiedBfsg" :key="request.newPR?.request_id||request.oldPR?.request_id">
        <tr>
          <td>{{ request.type }}<br>{{request.semester}}</td>
          <PayoutRequestDiff :before="request.oldPR" :after="request.newPR"/>
        </tr>
      </template>
      <template v-for="request in studentBody.modifiedVorankuendigung"
                :key="request.newPR?.request_id||request.oldPR?.request_id">
        <tr>
          <td>{{ request.type }}<br>{{ request.semester }}</td>
          <PayoutRequestDiff :before="request.oldPR" :after="request.newPR"/>
        </tr>
      </template>
      <template v-for="singleDiff in studentBody.documents" :key="singleDiff.filename">
        <tr>
          <td>Dokument</td>
          <DocumentDiff :before="singleDiff.oldDocument" :after="singleDiff.newDocument"/>
        </tr>
      </template>
      <template v-if="studentBody.annotationDiff">
        <tr>
          <td>Haushaltsjahr</td>
          <GenericDiff :before="studentBody.annotationDiff.oldString"
                       :after="studentBody.annotationDiff.newString"/>
        </tr>
      </template>
      <template v-if="studentBody.statutesDiff">
        <tr>
          <td>Fachschaftssatzung</td>
          <GenericDiff :before="studentBody.statutesDiff.oldString"
                       :after="studentBody.statutesDiff.newString"/>
        </tr>
      </template>
      <template v-if="studentBody.financialYearStartDiff">
        <tr>
          <td>Start des Haushaltsjahres</td>
          <GenericDiff :before="studentBody.financialYearStartDiff.oldString"
                       :after="studentBody.financialYearStartDiff.newString"/>
        </tr>
      </template>
      <template v-if="studentBody.proceedingsUrlDiff">
        <tr>
          <td>URL für Sitzungsprotokolle</td>
          <GenericDiff :before="studentBody.proceedingsUrlDiff.oldString"
                       :after="studentBody.proceedingsUrlDiff.newString"/>
        </tr>
      </template>
      </tbody>
    </table>
  </template>
</template>

<style scoped>

</style>