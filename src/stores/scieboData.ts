import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type {IData} from "@/interfaces";

export const useScieboDataStore = defineStore('sciebodata', () => {
    const data: Ref<null | IData> = ref(null);

    return {data}
})
