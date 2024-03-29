import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'
import {getFixedDateFromUrl, resetFixedDateInUrl} from "@/util";

export const useFixedDateStore = defineStore('fixedDate', () => {
    const date: Ref<null | string> = ref(getFixedDateFromUrl());

    function reset() {
        date.value = null;
        resetFixedDateInUrl();
    }

    return {date, reset}
})
