<script setup lang="ts">


import {computed, onBeforeMount, type Ref, ref} from "vue";
import {
  editPermissions,
  getUsernameFromUrl,
  hasAnyFsPermission,
  hasFsPermission,
  loadUsersList,
  PERMISSIONS,
  permissionToString
} from "@/util";
import {useAccountStore} from "@/stores/account";
import {useScieboDataStore} from "@/stores/scieboData";
import type {IPermission, IPermissionKey, IUserWithPermissions} from "@/interfaces";
import {useTokenStore} from "@/stores/token";

const account = useAccountStore();
const sciebo = useScieboDataStore();
const token = useTokenStore();

const fsen = computed(() => [...(sciebo.data?.studentBodies.keys() || [])].sort())

const editPermissionsUsername = ref(getUsernameFromUrl());
const editPermissionsAdmin = ref(false);
const editPermissionsPermissions: Ref<IPermission[]> = ref([]);
const permissionsMessage: Ref<null | string> = ref(null);

const updatePermission = (fs: string, permission: IPermissionKey, value: boolean) => {
  console.log(fs, permission, value, editPermissionsPermissions)
  const permissionForFS = editPermissionsPermissions.value.filter(p => p.fs === fs);
  if (permissionForFS.length) {
    permissionForFS[0][permission] = value;
  } else {
    const newPermission: IPermission = {
      fs: fs,
      read_permissions: false,
      write_permissions: false,
      read_files: false,
      read_public_data: false,
      write_public_data: false,
      read_protected_data: false,
      write_protected_data: false,
      submit_payout_request: false,
      locked: false,
    }
    newPermission[permission] = value;
    editPermissionsPermissions.value = [...editPermissionsPermissions.value, newPermission].sort();
  }
}


const editPermissionsWithData = async () => {
  permissionsMessage.value = null;
  const editResult = await editPermissions(
      account.user?.admin,
      editPermissionsUsername.value,
      editPermissionsAdmin.value,
      editPermissionsPermissions.value,
      token.apiToken,
  );
  permissionsMessage.value = editResult?.message || null;
  usersList.value = await loadUsersList(token.apiToken);
}


const loadEditPermissions = (user: IUserWithPermissions | undefined) => {
  if (!user) {
    return;
  }
  editPermissionsUsername.value = user.username;
  editPermissionsAdmin.value = user.admin;
  editPermissionsPermissions.value = user.permissions;
}

const usersList: Ref<Map<string, IUserWithPermissions> | null> = ref(null);
onBeforeMount(async () => {
  usersList.value = await loadUsersList(token.apiToken);
  if (editPermissionsUsername.value) {
    loadEditPermissions(usersList.value?.get(editPermissionsUsername.value));
  }
})

</script>

<template>
  <div class="section">

    <h1 class="title is-1">Berechtigungen bearbeiten</h1>

    <div class="field">
      <label class="label" for="create-account-username">Login-Name</label>
      <div class="control">
        <input class="input" id="edit-permissions-username" type="text" placeholder="vorname.nachname" readonly
               v-model="editPermissionsUsername">
      </div>
      <p v-if="!editPermissionsUsername" class="help is-danger">
        Öffne diese Seite über den Rechte-Bearbeiten-Link in der Accountliste, um Berechtigungen für einen Account zu
        bearbeiten.
      </p>
    </div>
    <template v-if="editPermissionsUsername">
      <template v-if="account.user?.admin">
        <div class="field">
          <label class="checkbox" for="create-account-admin">
            <input type="checkbox" id="edit-permissions-admin" v-model="editPermissionsAdmin">
            Admin
          </label>
        </div>

        <hr>

        <template v-for="fs in fsen" :key="fs">
          <details :open="hasAnyFsPermission(editPermissionsPermissions, fs)">
            <summary>{{ fs }}</summary>
            <ul>
              <li v-for="permission in PERMISSIONS" :key="permission">
                <label class="checkbox">
                  <input type="checkbox"
                         :checked="hasFsPermission(editPermissionsPermissions, fs, permission)"
                         @click="(event)=>updatePermission(fs, permission, (event.target as HTMLInputElement).checked)">
                  {{ permissionToString(permission) }}
                </label>
              </li>
              <li>
                <label class="checkbox">
                  <input type="checkbox"
                         :checked="hasFsPermission(editPermissionsPermissions, fs, 'locked')"
                         @click="(event)=>updatePermission(fs, 'locked', (event.target as HTMLInputElement).checked)">
                  {{ permissionToString('locked') }}
                </label>
              </li>
            </ul>
          </details>
        </template>
      </template>
      <template v-else>
        <hr>

        <b>Berechtigungen:</b>

        <template v-for="p in account.user?.permissions" :key="p.fs">
          <template v-if="p.write_permissions">
            <details open>
              <summary>{{ p.fs }}</summary>
              <ul>
                <template v-for="permission in PERMISSIONS" :key="permission">
                  <li>
                    <label class="checkbox">
                      <input type="checkbox"
                             :disabled="hasFsPermission(editPermissionsPermissions, p.fs, 'locked')"
                             :checked="hasFsPermission(editPermissionsPermissions, p.fs, permission)"
                             @click="(event)=>updatePermission(p.fs, permission, (event.target as HTMLInputElement).checked)">
                      {{ permissionToString(permission) }}
                    </label>
                  </li>
                </template>
                <li>
                  <label class="checkbox" disabled>
                    <input type="checkbox" disabled
                           :checked="hasFsPermission(editPermissionsPermissions, p.fs, 'locked')">
                    {{ permissionToString('locked') }}
                  </label>
                </li>
              </ul>
            </details>
          </template>
        </template>
      </template>

      <button class="button is-primary" @click="editPermissionsWithData">Rechte speichern</button>
    </template>

    <article v-if="permissionsMessage" class="message">
      <div class="message-body">
        {{ permissionsMessage }}
      </div>
    </article>

  </div>
</template>

<style scoped>
ul {
  margin-left: 2em;
  list-style-type: circle;
}
</style>
