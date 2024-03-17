<script setup lang="ts">

import {onBeforeMount, type Ref, ref} from "vue";
import {changePassword, updatePageTitle} from "@/util";
import {useTokenStore} from "@/stores/token";

const token = useTokenStore();

const currentPassword = ref('');
const newPassword = ref('');
const message: Ref<string | null> = ref(null);

const changePasswordWithData = async () => {
  message.value = null;
  message.value = await changePassword(
      currentPassword.value,
      newPassword.value,
      token.apiToken,
  ) || null;
}

onBeforeMount(()=>{
  updatePageTitle('Passwort ändern');
});
</script>

<template>
  <div class="section">

    <h1 class="title is-1">Passwort ändern</h1>

    <div class="field">
      <label class="label" for="current-password">Aktuelles Passwort</label>
      <div class="control">
        <input class="input" id="current-password" type="password" placeholder="dein aktuelles Passwort"
               v-model="currentPassword">
      </div>
    </div>
    <div class="field">
      <label class="label" for="new-password">Neues Passwort</label>
      <div class="control">
        <input class="input" id="new-password" type="password" placeholder="am besten zufällig generiert"
               v-model="newPassword">
      </div>
    </div>
    <button class="button is-primary" @click="changePasswordWithData">Passwort ändern</button>

    <article v-if="message" class="message">
      <div class="message-body">
        {{ message }}
      </div>
    </article>

  </div>
</template>
