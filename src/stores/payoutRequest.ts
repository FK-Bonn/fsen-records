import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type {INewPayoutRequestData} from "@/interfaces";

export const usePayoutRequestStore = defineStore('payoutRequest', () => {
    const afsg: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
    const bfsg: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);
    const vorankuendigung: Ref<null | Map<string, INewPayoutRequestData[]>> = ref(null);

    return {afsg, bfsg, vorankuendigung}
})
