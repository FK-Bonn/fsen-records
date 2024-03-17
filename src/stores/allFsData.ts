import {ref} from 'vue'
import type {Ref} from 'vue'
import {defineStore} from 'pinia'
import type {IAllFsData} from "@/interfaces";

export const useAllFsData = defineStore('allFsData', () => {
    const data: Ref<null | IAllFsData> = ref(null);

    function set(allFsData: IAllFsData | null) {
        data.value = allFsData;
    }

    return {data, set}
})
