<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import {computed, onBeforeMount, ref, watch} from "vue";
import {getAllFsData, loadLoggedInUser, updatePageTitle} from "@/util";
import {useAllFsData} from "@/stores/allFsData";
import {useRouter} from "vue-router";
import Keycloak from "keycloak-js";

const token = useTokenStore();
const account = useAccountStore();
const allFsData = useAllFsData();

const username = ref('');
const password = ref('');

const router = useRouter();

const doLogin = () => token.keycloak.login();

const login = () => {
  const formData = new FormData();
  formData.append('username', username.value);
  formData.append('password', password.value);

  fetch(import.meta.env.VITE_API_URL + '/token', {method: 'POST', body: formData})
      .then(response => {
        if (response.status !== 200) {
          return Promise.reject('Login fehlgeschlagen.');
        }
        return response.json();
      })
      .then(response => {
        const accessToken = response['access_token'];
        token.login(accessToken);
        return loadLoggedInUser(token.token());
      })
      .then(user => {
        account.login(user);
        return getAllFsData(token.token());
      }).then(fsData => {
        allFsData.set(fsData);
        router.push({name: 'home'});
  }, (message) => {
    alert(message);
  });
}

watch(() => token.isLoggedIn(), (value, oldValue) => {
  if (value) {
    router.push({name: 'home'})
  }
})

onBeforeMount(()=>{
  updatePageTitle('Login');
});
</script>

<template>
  <div class="section">

    <h1 class="title">Login</h1>
    <div class="mb-4">
      <button class="button is-uni-blue is-large" @click="doLogin">Login mit Uni-ID</button>
    </div>

    <hr>

    <form @submit.prevent="login">
    <div class="field">
      <p class="control">
        <input class="input" type="text" placeholder="user.name" v-model="username">
      </p>
    </div>
    <div class="field">
      <p class="control">
        <input class="input" type="password" placeholder="Passwort" v-model="password">
      </p>
    </div>
    <div class="field">
      <p class="control">
        <button class="button" @click="login">
          Login
        </button>
      </p>
    </div>
    </form>

  </div>
</template>

<style scoped>
.is-uni-blue {
  background-color: rgb(7, 82, 154);
  color: white;
}
</style>
