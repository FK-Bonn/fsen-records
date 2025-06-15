<script setup lang="ts">
import {computed, type ComputedRef, onBeforeMount, type Ref, ref} from "vue";
import type {IUserWithPermissions} from "@/interfaces";
import {hasAnyPermission, loadUsersList, updatePageTitle} from "@/util";
import {useTokenStore} from "@/stores/token";
import AccountsTable from "@/components/accounts/AccountsTable.vue";

const token = useTokenStore();

const usersList: Ref<Map<string, IUserWithPermissions> | null> = ref(null);

const filterValue: Ref<string> = ref('');

onBeforeMount(async () => {
  usersList.value = await loadUsersList(token.token());
})

const clearFilter = () => {
  filterValue.value = '';
}

const sortUsers = (a: IUserWithPermissions, b: IUserWithPermissions) => {
  return a.full_name > b.full_name ? 1 : b.full_name > a.full_name ? -1 : 0;
}

const usersWithPermissions: ComputedRef<IUserWithPermissions[]> = computed(() => [...(usersList.value?.values() || [])]
    .filter(value => hasAnyPermission(value))
    .sort(sortUsers) || [])
const usersWithoutPermissions: ComputedRef<IUserWithPermissions[]> = computed(() => [...(usersList.value?.values() || [])]
    .filter(value => !hasAnyPermission(value))
    .sort(sortUsers) || [])


onBeforeMount(()=>{
  updatePageTitle('Accounts');
});
</script>

<template>
  <div class="section">
    <h1 class="title is-1">Accounts</h1>

    <div class="field has-addons">
      <p class="control">
        <a class="button is-static">
          Filter
        </a>
      </p>
      <p class="control is-expanded">
        <input class="input" type="text" placeholder="Name, Login-Name, Fachschaft oder Berechtigung"
               @keydown.esc="clearFilter" v-model="filterValue">
      </p>
    </div>

    <AccountsTable :users="usersWithPermissions" :filterValue="filterValue"/>


    <h1 class="title is-1">Accounts ohne Berechtigungen</h1>
    <AccountsTable :users="usersWithoutPermissions" :filterValue="filterValue"/>

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
