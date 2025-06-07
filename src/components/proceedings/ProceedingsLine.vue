<script setup lang="ts">
import {downloadFile, formatDate} from "@/util";
import type {IProceedings} from "@/interfaces";
import {useTokenStore} from "@/stores/token";
import {computed} from "vue";

const props = defineProps<{
  fs: string,
  item: IProceedings,
}>()

const token = useTokenStore();
const baseUrl = import.meta.env.VITE_API_URL;
const downloadUrl = computed(() => `${baseUrl}/proceedings/${props.fs}/Prot-${props.item.committee}-${props.item.date}.pdf`);
const tags = computed(() => props.item.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== ''));

const download = () => {
  downloadFile(downloadUrl.value, token.token());
}

</script>

<template>
  <template v-if="token.isLoggedIn()">
    <a :href="downloadUrl" class="mr-3" @click.prevent="download">
      📃 {{ item.committee }}-Protokoll vom {{ formatDate(new Date(item.date)) }}
    </a>
  </template>
  <template v-else>
    <a :href="downloadUrl" class="mr-3">
      📃 {{ item.committee }}-Protokoll vom {{ formatDate(new Date(item.date)) }}
    </a>
  </template>

  <template v-for="tag in tags" :key="tag">
    <span class="tag is-light">{{ tag }}</span>
  </template>
</template>

<style scoped>
.tag {
  margin-right: .2rem;
}
</style>
