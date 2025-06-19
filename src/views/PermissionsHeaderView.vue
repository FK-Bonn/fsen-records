<script setup lang="ts">
import {useTokenStore} from "@/stores/token";
import {computed} from "vue";
import {useAccountStore} from "@/stores/account";
import CopyableTag from "@/components/CopyableTag.vue";

const token = useTokenStore();
const account = useAccountStore();


const showPermissionsHeader = computed(() => account.user && !account.user.admin && account.user.permissions.length === 0 && !token.apiToken);
const url = computed(() => location.origin + '/accounts/edit-permissions?user=' + account.user?.username)
</script>

<template>
  <template v-if="showPermissionsHeader">
    <section class="hero is-warning">
      <div class="hero-body">
        <p class="title">Du hast aktuell keine Berechtigungen</p>

        <p class="mb-2">
          Sende den folgenden Link an die Person, die für deine Fachschaft Berechtigungen verteilen darf,
          damit sie dir Berechtigungen zuteilen kann:
        </p>

        <p>
          <CopyableTag :text="url" :copy-text="url" :bold="true" tag-class="is-large"/>
        </p>

        <p>
          <small>Auf den Link klicken/tippen, um ihn in die Zwischenablage zu kopieren</small>
        </p>

      </div>
    </section>
  </template>
</template>

<style scoped>
</style>
