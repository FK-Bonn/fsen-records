<script setup lang="ts">


import {computed, type ComputedRef, onBeforeMount, type Ref, ref} from "vue";
import type {IUserWithPermissions} from "@/interfaces";
import {loadUsersList, permissionsToString} from "@/util";
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import CopyableTag from "@/components/CopyableTag.vue";

const token = useTokenStore();
const account = useAccountStore();

const usersList: Ref<Map<string, IUserWithPermissions> | null> = ref(null);


const hasEditPermission = () => {
  if (!account.user) {
    return false;
  }
  return account.user.admin || account.user.permissions.some(permission => permission.write_permissions);
}

const loadEditPermissions = (user: IUserWithPermissions) => {
  alert('todo');
}

const loadResetPassword = (user: IUserWithPermissions) => {
  alert('todo');
}


onBeforeMount(async () => {
  usersList.value = await loadUsersList(token.apiToken);
})

const users: ComputedRef<IUserWithPermissions[]> = computed(() => [...(usersList.value?.values() || [])].sort((a, b) => a.username > b.username ? 1 : b.username > a.username ? -1 : 0) || [])
</script>

<template>
  <div class="section">
    <h1 class="title is-1">Accounts</h1>

    <table class="table">
      <thead>
      <tr>
        <th>Login-Name</th>
        <th></th>
        <th>Berechtigungen</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in users" :key="user.username">
        <td>
          <CopyableTag :text="user.username"/>
          <br><small class="has-text-grey-light">erstellt von {{ user.created_by }}</small>
        </td>
        <td>
          <button v-if="hasEditPermission()" class="button is-small"
                  @click="()=>loadEditPermissions(user)">
            Rechte bearbeiten
          </button>
          <button v-if="account.user?.admin" class="button is-small"
                  @click="()=>loadResetPassword(user)">
            Passwort zurücksetzen
          </button>
        </td>
        <td>
          <span v-if="user.admin" class="tag is-info">Admin</span>
          <ul>
            <li v-for="permissions in (user.permissions.map(permissionsToString) || [])"
                :key="permissions">
              {{ permissions }}
            </li>
          </ul>
        </td>
      </tr>
      </tbody>
    </table>

    <ul>

    </ul>
  </div>
</template>

<style scoped>
ul {
  margin-left: 2em;
  list-style-type: circle;
}

small {
  font-size: 60%;
}
</style>
