<script setup lang="ts">
import type {IUserWithPermissions} from "@/interfaces";
import {PERMISSIONS, permissionsToString, permissionToString} from "@/util";
import {useAccountStore} from "@/stores/account";
import SimpleCopyableTag from "@/components/SimpleCopyableTag.vue";
import {computed} from "vue";

const props = defineProps<{
  users: IUserWithPermissions[],
  filterValue: string,
}>()

const account = useAccountStore();

const hasEditPermission = () => {
  if (!account.user) {
    return false;
  }
  return account.user.admin || account.user.permissions.some(permission => permission.write_permissions);
}

const filterUser = (user: IUserWithPermissions)=>{
  const filterValue = props.filterValue.toLowerCase();
  return user.full_name.toLowerCase().includes(filterValue)
      || user.username.toLowerCase().includes(filterValue)
      || (user.admin ? 'admin' : '').includes(filterValue)
      || user.permissions.some(permission => permission.fs.toLowerCase().includes(filterValue))
      || PERMISSIONS.some(permissionName => user.permissions.some(
          permission => permission[permissionName] && permissionToString(permissionName)?.toLowerCase().includes(filterValue)
      ));
}

const filteredUsers = computed(() => props.users.filter(filterUser));
</script>

<template>
  <p><b>{{filteredUsers.length}}</b> von {{props.users.length}} Accounts werden angezeigt</p>
  <table class="table">
    <thead>
    <tr>
      <th>Name</th>
      <th></th>
      <th>Berechtigungen</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="user in filteredUsers" :key="user.username">
      <td>
        <b>{{ user.full_name }}</b>
        <br>
        <SimpleCopyableTag :text="user.username"/>
        <br>
        <small class="has-text-grey-light">erstellt von {{ user.created_by }}</small>
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
