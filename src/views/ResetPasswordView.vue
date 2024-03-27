<script setup lang="ts">

import {type Ref, ref} from "vue";
import {getUsernameFromUrl, resetPassword} from "@/util";
import {useTokenStore} from "@/stores/token";

const token = useTokenStore();


const resetPasswordUsername = ref(getUsernameFromUrl());
const resetPasswordPassword = ref('');
const resetMessage: Ref<null | string> = ref(null);

const resetPasswordWithData = async () => {
  resetMessage.value = null;
  resetMessage.value = await resetPassword(
      resetPasswordUsername.value,
      resetPasswordPassword.value,
      token.apiToken,
  );
}
</script>

<template>
  <div class="section">

    <h1 class="title is-1">Passwort zurücksetzen</h1>

    <div class="field">
      <label class="label" for="create-account-username">Login-Name</label>
      <div class="control">
        <input class="input" id="reset-password-username" type="text" placeholder="vorname.nachname"
               v-model="resetPasswordUsername">
      </div>
    </div>
    <div class="field">
      <label class="label" for="create-account-password">Passwort</label>
      <div class="control">
        <input class="input" id="reset-password-password" type="text" placeholder="am besten zufällig generiert"
               v-model="resetPasswordPassword">
      </div>
    </div>
    <button class="button is-primary" @:click="resetPasswordWithData">Passwort ändern</button>
    <article v-if="resetMessage" class="message">
      <div class="message-body">
        {{ resetMessage }}
      </div>
    </article>

  </div>
</template>
