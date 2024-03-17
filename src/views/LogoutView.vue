<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";

const token = useTokenStore();
const account = useAccountStore();

const logout = ()=>{
  token.logout();
  account.logout();
}
</script>

<template>
  <div class="section">
    <h1 class="title">Logout</h1>
    <button class="button" @click="logout">Abmelden</button>
  </div>
</template>
