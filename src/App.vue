<script setup lang="ts">
import {RouterView} from 'vue-router'
import NavbarView from "@/views/NavbarView.vue";
import FooterView from "@/views/FooterView.vue";
import {useTokenStore} from "@/stores/token";
import {getAllFsData, getDocumentData, getPayoutRequestData, loadLoggedInUser, pojoToIData} from "@/util";
import {useAccountStore} from "@/stores/account";
import {useAllFsData} from "@/stores/allFsData";
import {usePayoutRequestStore} from "@/stores/payoutRequest";
import {computed, onBeforeMount, type Ref, ref, watch} from "vue";
import type {IData} from "@/interfaces";
import {useScieboDataStore} from "@/stores/scieboData";
import {useStudentBodiesStore} from "@/stores/studentBodies";
import ErrorList from "@/components/ErrorList.vue";
import {useFixedDateStore} from "@/stores/fixedDate";
import {useDocumentsStore} from "@/stores/documents";


const token = useTokenStore();
const account = useAccountStore();
const allFsData = useAllFsData();
const payoutRequests = usePayoutRequestStore();
const sciebo = useScieboDataStore();
const documents = useDocumentsStore();
const studentBodies = useStudentBodiesStore();
const fixedDate = useFixedDateStore();


const fetchDataError: Ref<null | string> = ref(null);
const documentsDataError: Ref<null | string> = ref(null);
const afsgPayoutRequestsDataError: Ref<null | string> = ref(null);
const bfsgPayoutRequestsDataError: Ref<null | string> = ref(null);
const vorankuendigungPayoutRequestsDataError: Ref<null | string> = ref(null);
const errors: Ref<string[]> = ref([]);

const loadData = () => {
  const url = fixedDate.date ? `/data/history/${fixedDate.date}-data.json` : "/data/data.json";
  fetch(url)
      .then(response => response.json(), () => {
        fetchDataError.value = "Fetching data failed";
      })
      .then(rawdata => {
        try {
          const data: IData = pojoToIData(rawdata);

          sciebo.data = data;
          fetchDataError.value = null;
          studentBodies.studentBodies = [...data.studentBodies.keys()].sort();
        } catch (err: any) {
          fetchDataError.value = err.message;
        }
      }, reason => {
        fetchDataError.value = reason;
      });
};

const loadDocuments = () => {
  getDocumentData(fixedDate.date)
      .then(data => {
        documents.data = data;
        documentsDataError.value = null;
      }, reason => {
        documentsDataError.value = reason;
      });
};


const loadPayoutRequestData = () => {
  getPayoutRequestData('afsg', fixedDate.date)
      .then(data => {
        payoutRequests.afsg = data;
        afsgPayoutRequestsDataError.value = null;
      }, reason => {
        afsgPayoutRequestsDataError.value = reason;
      });
  getPayoutRequestData('bfsg', fixedDate.date)
      .then(data => {
        payoutRequests.bfsg = data;
        bfsgPayoutRequestsDataError.value = null;
      }, reason => {
        bfsgPayoutRequestsDataError.value = reason;
      });
  getPayoutRequestData('vorankuendigung', fixedDate.date)
      .then(data => {
        payoutRequests.vorankuendigung = data;
        vorankuendigungPayoutRequestsDataError.value = null;
      }, reason => {
        vorankuendigungPayoutRequestsDataError.value = reason;
      });
};

const loadError = () => {
  fetch("/data/error.json")
      .then(response => response.json(), () => {
        errors.value = [];
      })
      .then(value => {
        errors.value = value;
      });
};

const loadAllFsData = () => {
  getAllFsData(token.apiToken).then(data => allFsData.set(data));
};

const loadUser = () => {
  loadLoggedInUser(token.apiToken).then(user => account.login(user));
};


onBeforeMount(() => {
  loadUser();
  loadError();
  loadData();
  loadDocuments();
  loadPayoutRequestData();
  loadAllFsData();
});

watch(fixedDate, async () => {
  loadData();
  loadDocuments();
  loadPayoutRequestData();
  loadAllFsData();
});

const backgroundColourIfFixed = computed(()=>fixedDate.date ? ' has-background-grey-light' : '');

</script>

<template>
  <section class="main-content columns is-fullheight">
    <aside class="column is-2 is-narrow-mobile is-fullheight section has-background-white-bis menu">
      <NavbarView/>
    </aside>

    <div :class="'column is-10' + backgroundColourIfFixed">
      <ErrorList v-if="errors.length" :errors="errors"/>
      <pre v-if="fetchDataError">{{fetchDataError}}</pre>
      <pre v-if="documentsDataError">{{documentsDataError}}</pre>
      <pre v-if="afsgPayoutRequestsDataError">{{afsgPayoutRequestsDataError}}</pre>
      <pre v-if="bfsgPayoutRequestsDataError">{{bfsgPayoutRequestsDataError}}</pre>
      <pre v-if="vorankuendigungPayoutRequestsDataError">{{vorankuendigungPayoutRequestsDataError}}</pre>
      <RouterView/>
    </div>
  </section>

  <footer class="footer">
    <FooterView/>
  </footer>
</template>

<style scoped>
</style>
