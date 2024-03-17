import {ref} from 'vue'
import type {Ref} from 'vue'
import {defineStore} from 'pinia'

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
}, {persist: true})
