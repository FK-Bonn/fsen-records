<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";

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
      <RouterLink to="/">Fachschaften</RouterLink>
    </li>
    <li>
      <RouterLink to="/vorankuendigung">Vorankündigungen</RouterLink>
    </li>
    <li>
      <RouterLink to="/bfsg">BFSG-Anträge</RouterLink>
    </li>
    <li>
      <RouterLink to="/finanzuebersicht">Antrags-Finanzübersicht</RouterLink>
      <ul>
        <li>
          <RouterLink to="/finanzuebersicht/afsg">AFSG</RouterLink>
        </li>
        <li>
          <RouterLink to="/finanzuebersicht/bfsg">BFSG</RouterLink>
        </li>
      </ul>
    </li>
    <li>
      <RouterLink to="/hhp">Haushaltsplansentwurf</RouterLink>
    </li>
  </ul>
  <p class="menu-label">
    Verwaltung
  </p>
  <ul class="menu-list">
    <template v-if="!token.isLoggedIn()">
      <li>
        <RouterLink to="/login">Anmelden</RouterLink>
      </li>
    </template>
    <template v-if="token.isLoggedIn()">
      <li>
        <RouterLink to="/accounts">Accounts</RouterLink>
        <ul>
          <li>
            <RouterLink to="/accounts/create">Account anlegen</RouterLink>
          </li>
          <li>
            <RouterLink to="/accounts/edit-permissions">Rechte bearbeiten</RouterLink>
          </li>
          <li>
            <RouterLink to="/accounts/reset-password">Passwort zurücksetzen</RouterLink>
          </li>
        </ul>
      </li>
      <li>
        <RouterLink to="/change-password">Passwort ändern</RouterLink>
      </li>
      <li>
        <RouterLink to="/logout">Abmelden</RouterLink>
      </li>
    </template>
  </ul>
</template>

<style scoped>

</style>