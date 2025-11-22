<script setup lang="ts">
import {computed, onBeforeMount, type Ref, ref} from "vue";
import {
  createAccount,
  hasAnyFsPermission,
  hasFsPermission,
  PERMISSIONS,
  permissionToString,
  updatePageTitle
} from "@/util";
import {useAccountStore} from "@/stores/account";
import type {IPermission, IPermissionKey} from "@/interfaces";
import {useTokenStore} from "@/stores/token";
import {useAllFsData} from "@/stores/allFsData";

const account = useAccountStore();
const fsData = useAllFsData();
const token = useTokenStore();

const fsen = computed(() => fsData.data ? [...(Object.keys(fsData.data))].sort() : [])

const createAccountUsername = ref('');
const createAccountPassword = ref('');
const createAccountAdmin = ref(false);
const createAccountPermissions: Ref<IPermission[]> = ref([]);
const createdMessage: Ref<null | string> = ref(null);


const updateCreatePermission = (fs: string, permission: IPermissionKey, value: boolean) => {
  const permissionForFS = createAccountPermissions.value.filter(p => p.fs === fs);
  if (permissionForFS.length) {
    permissionForFS[0][permission] = value;
  } else {
    const newPermission = {
      fs: fs,
      read_permissions: false,
      write_permissions: false,
      read_files: false,
      read_public_data: false,
      write_public_data: false,
      read_protected_data: false,
      write_protected_data: false,
      submit_payout_request: false,
      upload_proceedings: false,
      delete_proceedings: false,
      upload_documents: false,
      locked: false,
    }
    newPermission[permission] = value;
    createAccountPermissions.value = [...createAccountPermissions.value, newPermission].sort();
  }
}
const createAccountWithData = async () => {
  createdMessage.value = null;
  const createResult = await createAccount(
      createAccountUsername.value,
      createAccountPassword.value,
      createAccountAdmin.value,
      createAccountPermissions.value,
      token.token(),
  );
  createdMessage.value = createResult?.message || null;
}

const canCreateAccount = computed(()=>account.user?.admin || account.user?.permissions.some(value => value.write_permissions));

onBeforeMount(()=>{
  updatePageTitle('Account anlegen');
});
</script>

<template>
  <div class="section">

    <h1 class="title is-1">Account anlegen</h1>

    <div class="field">
      <label class="label" for="create-account-username">Login-Name</label>
      <div class="control">
        <input class="input" id="create-account-username" type="text" placeholder="vorname.nachname"
               v-model="createAccountUsername">
      </div>
    </div>
    <div class="field">
      <label class="label" for="create-account-password">Passwort</label>
      <div class="control">
        <input class="input" id="create-account-password" type="text" placeholder="am besten zufällig generiert"
               v-model="createAccountPassword">
      </div>
    </div>
    <template v-if="account.user?.admin">
      <div class="field">
        <label class="checkbox" for="create-account-admin">
          <input type="checkbox" id="create-account-admin" v-model="createAccountAdmin">
          Admin
        </label>
      </div>

      <hr>

      <template v-for="fs in fsen" :key="fs">
        <details :open="hasAnyFsPermission(createAccountPermissions, fs)">
          <summary>{{ fs }}</summary>
          <ul>
            <li v-for="permission in PERMISSIONS" :key="permission">
              <label class="checkbox">
                <input type="checkbox"
                       :checked="hasFsPermission(createAccountPermissions, fs, permission)"
                       @click="(event)=>updateCreatePermission(fs, permission, (event.target as HTMLInputElement).checked)">
                {{ permissionToString(permission) }}
              </label>
            </li>
            <li>
              <label class="checkbox">
                <input type="checkbox"
                       :checked="hasFsPermission(createAccountPermissions, fs, 'locked')"
                       @click="(event)=>updateCreatePermission(fs, 'locked', (event.target as HTMLInputElement).checked)">
                {{permissionToString('locked')}}
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
                           :checked="hasFsPermission(createAccountPermissions, p.fs, permission)"
                           @click="(event)=>updateCreatePermission(p.fs, permission, (event.target as HTMLInputElement).checked)">
                    {{ permissionToString(permission) }}
                  </label>
                </li>
              </template>
            </ul>
          </details>
        </template>
        <template v-else>
          <p class="has-text-grey">{{ p.fs }}: Du hast keine Berechtigung, für diese Fachschaft Rechte zu vergeben.</p>
        </template>
      </template>
    </template>

    <button class="button is-primary" @click="createAccountWithData" :disabled="!canCreateAccount">
      Account erstellen
    </button>
    <article v-if="createdMessage" class="message">
      <div class="message-body">
        {{ createdMessage }}
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
