import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'
import {isLocalStorageEnabled} from "@/util";

export const useTokenStore = defineStore('token', () => {
    const apiToken: Ref<null | string> = ref(null);

    function isLoggedIn() {
        return apiToken.value !== null;
    }

    function login(token: string) {
        apiToken.value = token;
    }

    function logout() {
        apiToken.value = null;
    }

    return {apiToken, isLoggedIn, login, logout}
}, {persist: isLocalStorageEnabled()})
