<script setup lang="ts">
import type {IUserWithPermissions} from "@/interfaces";
import {permissionsToString} from "@/util";
import {useAccountStore} from "@/stores/account";

const props = defineProps<{
  users: IUserWithPermissions[],
}>()

const account = useAccountStore();

const hasEditPermission = () => {
  if (!account.user) {
    return false;
  }
  return account.user.admin || account.user.permissions.some(permission => permission.write_permissions);
}
</script>

<template>
  <table class="table">
    <thead>
    <tr>
      <th>Login-Name</th>
      <th></th>
      <th>Berechtigungen</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="user in props.users" :key="user.username">
      <td>
        <SimpleCopyableTag :text="user.username"/>
        <br><small class="has-text-grey-light">erstellt von {{ user.created_by }}</small>
      </td>
      <td>
        <RouterLink v-if="hasEditPermission()" class="is-inline-block"
                    :to="{name: 'accounts-edit-permissions', query: {'user': user.username}}">
          Rechte bearbeiten
        </RouterLink>&nbsp;
        <RouterLink v-if="account.user?.admin" class="is-inline-block"
                    :to="{name: 'accounts-reset-password', query: {'user': user.username}}">
          Passwort zurücksetzen
        </RouterLink>
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
