import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type {IDocumentDataForFs} from "@/interfaces";

export const useDocumentsStore = defineStore('documents', () => {
    const data: Ref<null | IDocumentDataForFs> = ref(null);

    return {data}
})
