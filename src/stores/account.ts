import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'
import type {IUserWithPermissions} from "@/interfaces";

export const useAccountStore = defineStore('account', () => {
    const user: Ref<null | IUserWithPermissions> = ref(null);

    function login(name: IUserWithPermissions | null) {
        user.value = name;
    }

    function logout() {
        user.value = null;
    }

    return {user, login, logout}
})
