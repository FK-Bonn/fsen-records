<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {useAccountStore} from "@/stores/account";
import {onBeforeMount, ref} from "vue";
import {getAllFsData, loadLoggedInUser, updatePageTitle} from "@/util";
import {useAllFsData} from "@/stores/allFsData";
import {useRouter} from "vue-router";

const token = useTokenStore();
const account = useAccountStore();
const allFsData = useAllFsData();

const username = ref('');
const password = ref('');

const router = useRouter();


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
        return loadLoggedInUser(token.apiToken);
      })
      .then(user => {
        account.login(user);
        return getAllFsData(token.apiToken);
      }).then(fsData => {
        allFsData.set(fsData);
        router.push({name: 'home'});
  }, (message) => {
    alert(message);
  });
}

onBeforeMount(()=>{
  updatePageTitle('Login');
});
</script>

<template>
  <div class="section">

    <h1 class="title">Login</h1>

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
        <button class="button is-primary" @click="login">
          Login
        </button>
      </p>
    </div>
    </form>

  </div>
</template>
