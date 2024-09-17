import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useStudentBodiesStore = defineStore('studentBodies', () => {
    const studentBodies: Ref<string[]> = ref([]);

    return {studentBodies}
})
