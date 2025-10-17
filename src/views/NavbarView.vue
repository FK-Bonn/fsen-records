<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import ColourSchemeSwitcher from "@/components/ColourSchemeSwitcher.vue";

const token = useTokenStore();
const account = useAccountStore();
</script>

<template>
  <span class="tag is-primary" v-if="token.isLoggedIn()">
    Hallo,&thinsp;<b>{{ account.user?.full_name }}</b>!
  </span>
  <code>{{ account.user?.username }}</code>
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
    </li>
    <li>
      <RouterLink :to="{name: 'hhp'}">Haushaltsplansentwurf</RouterLink>
    </li>
    <li>
      <RouterLink :to="{name: 'sitzungsprotokolle'}">Sitzungsprotokolle</RouterLink>
    </li>
  </ul>
  <p class="menu-label">
    Wahlen &amp; Satzungen
  </p>
  <ul class="menu-list">
    <li>
      <RouterLink :to="{name: 'wahltermine'}">Wahl&shy;termine</RouterLink>
    </li>
    <li>
      <RouterLink :to="{name: 'sglieds'}">SGliedS</RouterLink>
    </li>
  </ul>
  <p class="menu-label">
    Verwaltung
  </p>
  <ul class="menu-list">
    <li>
      <RouterLink :to="{name: 'help'}">Hilfe</RouterLink>
    </li>
    <template v-if="!token.isLoggedIn()">
      <li>
        <RouterLink :to="{name: 'login'}">Anmelden</RouterLink>
      </li>
    </template>
    <template v-if="token.isLoggedIn()">
      <li>
        <RouterLink :to="{name: 'accounts'}">Accounts</RouterLink>
        <ul v-if="account.user?.admin">
          <li>
            <RouterLink :to="{name: 'accounts-create'}">Account anlegen</RouterLink>
          </li>
          <li>
            <RouterLink :to="{name: 'accounts-reset-password'}">Passwort zurücksetzen</RouterLink>
          </li>
        </ul>
      </li>
      <li v-if="account.user?.admin">
        <RouterLink :to="{name: 'change-password'}">Passwort ändern</RouterLink>
      </li>
      <li>
        <RouterLink :to="{name: 'logout'}">Abmelden</RouterLink>
      </li>
    </template>
  </ul>
  <ColourSchemeSwitcher/>
</template>

<style scoped>
.router-link-exact-active {
  --bulma-menu-item-h: var(--bulma-menu-item-selected-h);
  --bulma-menu-item-s: var(--bulma-menu-item-selected-s);
  --bulma-menu-item-l: var(--bulma-menu-item-selected-l);
  --bulma-menu-item-background-l: var(--bulma-menu-item-selected-background-l);
  --bulma-menu-item-color-l: var(--bulma-menu-item-selected-color-l);
}
</style>