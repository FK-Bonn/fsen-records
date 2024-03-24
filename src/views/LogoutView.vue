<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import {useRouter} from "vue-router";

const token = useTokenStore();
const account = useAccountStore();
const router = useRouter();

const logout = ()=>{
  token.logout();
  account.logout();
  router.push({name: 'home'});
}
</script>

<template>
  <div class="section">
    <h1 class="title">Logout</h1>
    <button class="button" @click="logout">Abmelden</button>
  </div>
</template>
