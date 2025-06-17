<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {computed} from "vue";
import {useAccountStore} from "@/stores/account";
import {transfer} from "@/util";

const token = useTokenStore();
const account = useAccountStore();

const doLogin = () => token.keycloak.login();
const doTransfer = () => {
  transfer(token.apiToken, token.token()).then(() => {
    token.apiToken = null;
    alert('Migration erfolgreich!');
    location.reload();
  }).catch(err => alert(err));
}

const showMigrationheader = computed(() => account.user && !account.user.admin && token.apiToken)
const showLoginPrompt = computed(() => showMigrationheader.value && !token.kcToken)
const showTransferPrompt = computed(() => showMigrationheader.value && !!token.kcToken)
</script>

<template>
  <template v-if="showMigrationheader">
    <section class="hero is-info">
      <div class="hero-body">
        <p class="title">Migriere deinen Account</p>
        <p class="subtitle">Login via Uni-ID</p>

        <p>
          Du bist direkt auf der Datendrehscheibe angemeldet.
          Wechsle auf den Login mit deiner Uni-ID.
        </p>

        <template v-if="showLoginPrompt">
          <p class="has-text-weight-bold">
            Schritt 1 von 2: Melde dich mit deiner Uni-ID an:
          </p>
          <button class="button is-uni-blue is-large" @click="doLogin">Login mit Uni-ID</button>
        </template>
        <template v-if="showTransferPrompt">
          <p class="has-text-weight-bold">
            Schritt 2 von 2: Übertrage deine Berechtigungen an <code>{{ account.user?.username }}</code>.
            Dein bisheriger Account wird anschließend deaktiviert.
          </p>
          <button class="button is-primary is-large" @click="doTransfer">Berechtigungen übertragen</button>
        </template>
      </div>
    </section>
  </template>
</template>

<style scoped>
.is-uni-blue {
  background-color: rgb(7, 82, 154);
  color: white;
}
</style>