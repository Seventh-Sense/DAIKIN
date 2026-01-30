<template>
  <LangSelect/>
  <ThemeSelect/>
  <div><a-date-picker v-model:value="value1" /></div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Dayjs } from 'dayjs';
import LangSelect from "@/components/LangSelect/index.vue";
import ThemeSelect from "@/components/ThemeSelect/index.vue";

const value1 = ref<Dayjs>();
</script>

<style lang="less" scoped>
</style>
