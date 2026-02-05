<script setup lang="ts">
import {ref} from "vue";
import IconPerson from "@/components/icons/IconPerson.vue";
import {useAccountStore} from "@/stores/account";
import {permissionsToString} from "@/util";

const account = useAccountStore();
const show = ref(false);

const showModal = () => {
  show.value = true;
}
const hideModal = () => {
  show.value = false;
}
</script>

<template>
    <span class="tag is-info is-light is-family-code user-info" @click="showModal">
      <IconPerson/>&nbsp;{{ account.user?.username }}
    </span>
  <template v-if="show">
    <div class="modal is-active">
      <div class="modal-background" @click="hideModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Berechtigungen</p>
          <button class="delete" aria-label="close" @click="hideModal"></button>
        </header>
        <section class="modal-card-body">
          <div class="content">
            <p>Dein Account <code>{{ account.user?.username }}</code> hat aktuell die folgenden Berechtigungen:</p>
            <ul>
              <li v-for="permissions in (account.user?.permissions.map(permissionsToString) || [])"
                  :key="permissions">
                {{ permissions }}
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </template>
</template>

<style scoped>
.user-info {
  cursor: pointer;
}
</style>
