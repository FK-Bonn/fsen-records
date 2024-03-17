import {ref} from 'vue'
import type {Ref} from 'vue'
import {defineStore} from 'pinia'
import type {IData, INewPayoutRequestData} from "@/interfaces";

export const useStudentBodiesStore = defineStore('studentBodies', () => {
    const studentBodies: Ref<string[]> = ref([]);

    return {studentBodies}
})
