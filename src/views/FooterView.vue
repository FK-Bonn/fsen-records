<script setup lang="ts">
const siteTitle = import.meta.env.VITE_SITE_TITLE;
const docsUrl = import.meta.env.VITE_API_URL + '/docs';
</script>

<template>
  <div class="content has-text-centered">
    <p>
      <strong>{{ siteTitle }}</strong> ist freie Software.
      <a :href="docsUrl">API-Dokumentation</a> ·
      <a href="https://github.com/FK-Bonn/fsen-records">Frontend</a> ·
      <a href="https://github.com/FK-Bonn/fsen-records-backend">Backend</a>
    </p>
  </div>
</template>

<style scoped>

</style>