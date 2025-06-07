import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore, type PiniaPluginContext} from 'pinia'
import {isLocalStorageEnabled, until} from "@/util";
import Keycloak from "keycloak-js";

export const useTokenStore = defineStore('token', () => {
    const apiToken: Ref<null | string> = ref(null);
    const kcToken: Ref<null | string> = ref(null);
    const refreshToken: Ref<null | string> = ref(null);
    let kcReady = false;
    const keycloak = new Keycloak({
        url: import.meta.env.VITE_KEYCLOAK_URL,
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        realm: import.meta.env.VITE_KEYCLOAK_REALM
    })
    keycloak.onReady = () => kcReady = true;

    async function token() {
        await until(() => kcReady);
        if (refreshToken.value) {
            const refreshed = await keycloak.updateToken(300);
            if (refreshed) {
                kcToken.value = keycloak.token || null;
                refreshToken.value = keycloak.refreshToken || null;
            }
        }
        if (kcToken.value) {
            return kcToken.value;
        }
        if (apiToken.value) {
            return apiToken.value;
        }
        return null;
    }

    function isLoggedIn() {
        return kcToken.value !== null || apiToken.value !== null;
    }

    function login(token: string) {
        apiToken.value = token;
    }

    function logout() {
        apiToken.value = null;
        kcToken.value = null;
        refreshToken.value = null;
    }

    return {
        apiToken,
        kcToken,
        refreshToken,
        keycloak,
        token,
        isLoggedIn,
        login,
        logout
    }
}, {
    persist: isLocalStorageEnabled() ? {
        pick: ['apiToken', 'kcToken', 'refreshToken'],
        afterHydrate: (context: PiniaPluginContext) => {
            context.store.keycloak.init({
                adapter: 'default',
                checkLoginIframe: false,
                responseMode: 'query',
                token: context.store.kcToken,
                refreshToken: context.store.refreshToken,
            }).then((value: boolean) => {
                context.store.kcToken = context.store.keycloak.token || null;
                context.store.refreshToken = context.store.keycloak.refreshToken || null;
            })
        },
    } : false
})
