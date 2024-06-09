<script setup lang="ts">
import {computed, type ComputedRef, onBeforeMount, type Ref, ref} from "vue";
import type {IUserWithPermissions} from "@/interfaces";
import {hasAnyPermission, loadUsersList, updatePageTitle} from "@/util";
import {useTokenStore} from "@/stores/token";
import AccountsTable from "@/components/accounts/AccountsTable.vue";

const token = useTokenStore();

const usersList: Ref<Map<string, IUserWithPermissions> | null> = ref(null);

onBeforeMount(async () => {
  usersList.value = await loadUsersList(token.apiToken);
})

const sortUsers = (a: IUserWithPermissions, b: IUserWithPermissions) => {
  return a.username > b.username ? 1 : b.username > a.username ? -1 : 0;
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

    <AccountsTable :users="usersWithPermissions"/>


    <h1 class="title is-1">Accounts ohne Berechtigungen</h1>
    <AccountsTable :users="usersWithoutPermissions"/>

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
