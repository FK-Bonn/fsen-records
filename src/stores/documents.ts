import {ref} from 'vue'
import type {Ref} from 'vue'
import {defineStore} from 'pinia'
import type {IData, IDocumentData, IDocumentDataForFs, INewPayoutRequestData} from "@/interfaces";

export const useDocumentsStore = defineStore('documents', () => {
    const data: Ref<null | IDocumentDataForFs> = ref(null);

    return {data}
})
