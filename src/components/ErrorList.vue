<script setup lang="ts">

defineProps<{
  errors: string[],
}>()
</script>

<template>
  <section class="section">
    <div class="container">
      <article class="message is-danger">
        <div class="message-header">
          <p>Probleme</p>
        </div>
        <div class="message-body">
          <ul>
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
</style>