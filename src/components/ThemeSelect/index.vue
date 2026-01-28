<template>
  <div>
    <FontAwesomeIcon
      v-if="themeStore.currentTheme === 'dark'"
      @click="handleThemeChange('light')"
      icon="fa-moon"
      size="lg"
      style="cursor: pointer;"
    />
    <FontAwesomeIcon
      v-else-if="themeStore.currentTheme === 'light'"
      @click="handleThemeChange('dark')"
      icon="fa-sun"
      size="lg"
      style="cursor: pointer;"
    />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from "@/pinia/modules/them";

const themeStore = useThemeStore();

const handleThemeChange = (key: string) => {
  themeStore.switchTheme(key);
};
</script>

<style lang="scss" scoped></style>
