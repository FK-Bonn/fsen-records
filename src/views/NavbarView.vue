<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import {useRoute} from "vue-router";

const token = useTokenStore();
const account = useAccountStore();
</script>

<template>
  <span class="tag is-primary" v-if="token.isLoggedIn()">
    Hallo,&thinsp;<b>{{ account.user?.username }}</b>!
  </span>
  <span class="tag is-info ml-1" v-if="account.user?.admin">
    Admin
  </span>
  <p class="menu-label">
    Finanzen &amp; Daten
  </p>
  <ul class="menu-list">
    <li>
      <RouterLink :to="{name: 'home'}">Fachschaften</RouterLink>
    </li>
    <li>
      <RouterLink :to="{name: 'vorankuendigung'}">Vorankündigungen</RouterLink>
    </li>
    <li>
      <RouterLink :to="{name: 'bfsg'}">BFSG-Anträge</RouterLink>
    </li>
    <li>
      <RouterLink :to="{name: 'finanzuebersicht'}">Antrags-Finanzübersicht</RouterLink>
      <ul>
        <li>
          <RouterLink :to="{name: 'finanzuebersicht-afsg'}">AFSG</RouterLink>
        </li>
        <li>
          <RouterLink :to="{name: 'finanzuebersicht-bfsg'}">BFSG</RouterLink>
        </li>
      </ul>
    </li>
    <li>
      <RouterLink :to="{name: 'hhp'}">Haushaltsplansentwurf</RouterLink>
    </li>
  </ul>
  <p class="menu-label">
    Verwaltung
  </p>
  <ul class="menu-list">
    <template v-if="!token.isLoggedIn()">
      <li>
        <RouterLink :to="{name: 'login'}">Anmelden</RouterLink>
      </li>
    </template>
    <template v-if="token.isLoggedIn()">
      <li>
        <RouterLink :to="{name: 'accounts'}">Accounts</RouterLink>
        <ul>
          <li>
            <RouterLink :to="{name: 'accounts-create'}">Account anlegen</RouterLink>
          </li>
          <li>
            <RouterLink :to="{name: 'accounts-edit-permissions'}">Rechte bearbeiten</RouterLink>
          </li>
          <li>
            <RouterLink :to="{name: 'accounts-reset-password'}">Passwort zurücksetzen</RouterLink>
          </li>
        </ul>
      </li>
      <li>
        <RouterLink :to="{name: 'change-password'}">Passwort ändern</RouterLink>
      </li>
      <li>
        <RouterLink :to="{name: 'logout'}">Abmelden</RouterLink>
      </li>
    </template>
  </ul>
</template>

<style scoped>
.router-link-exact-active {
  background-color: #485fc7;
  color: #fff;
}
.router-link-exact-active:hover {
  background-color: #2942ff;
  color: #fff;
}
</style>