import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'
import {isLocalStorageEnabled} from "@/util";

export const usePageSettingsStore = defineStore('pageSettings', () => {
    const showOnlyWhoCurrentlyCanBePaid: Ref<boolean> = ref(false);
    const compactMode: Ref<boolean> = ref(false);
    const showOnlySemestersWithPayoutRequests: Ref<boolean> = ref(false);
    const showOnlySemestersWithStar: Ref<boolean> = ref(false);
    const showFilenames: Ref<boolean> = ref(true);
    const displayFsData: Ref<boolean> = ref(true);
    const paleLowerDocuments: Ref<boolean> = ref(true);
    const displayAllAfsgSemesters: Ref<boolean> = ref(false);

    return {
        showOnlyWhoCurrentlyCanBePaid,
        compactMode,
        showOnlySemestersWithPayoutRequests,
        showOnlySemestersWithStar,
        showFilenames,
        displayFsData,
        paleLowerDocuments,
        displayAllAfsgSemesters,
    }
}, {persist: isLocalStorageEnabled()})
