<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useThemeStore } from "@/pinia/modules/them";

onMounted(() => {
  const themeStore = useThemeStore();
  themeStore.initTheme();
});
</script>

<style lang="less">
@import "@/assets/less/global.less";
@import "@/assets/less/light.less";
@import "@/assets/less/dark.less";
</style>
