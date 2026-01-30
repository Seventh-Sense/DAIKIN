<template>
  <a-config-provider :locale="currentLocale" :theme="antdThemeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from "vue";
import { useThemeStore } from "@/pinia/modules/them";
import { useLocaleStore } from "@/pinia/modules/locale";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import enUS from "ant-design-vue/es/locale/en_US";
import jaJP from "ant-design-vue/es/locale/ja_JP";
import "dayjs/locale/zh-cn";
import "dayjs/locale/ja";
import "dayjs/locale/en";
import dayjs from "dayjs";
import { theme } from "ant-design-vue";

const localeStore = useLocaleStore();
const themeStore = useThemeStore();

type SupportedLocale = "cn" | "en" | "jp";

const ANTD_LOCALE_MAP = {
  cn: zhCN,
  en: enUS,
  jp: jaJP,
} as const;

const DAYJS_LOCALE_MAP = {
  cn: "zh-cn",
  en: "en",
  jp: "ja",
} as const;

const currentLocale = computed(() => {
  const current = localeStore.currentLocale as SupportedLocale;
  return ANTD_LOCALE_MAP[current] ?? ANTD_LOCALE_MAP.cn;
});

const antdThemeConfig = computed(() => ({
  algorithm: themeStore.currentTheme === "dark" 
    ? theme.darkAlgorithm 
    : theme.defaultAlgorithm,
}));

const setDayjsLocale = () => {
  const current = localeStore.currentLocale as SupportedLocale;
  const targetLocale = DAYJS_LOCALE_MAP[current] ?? DAYJS_LOCALE_MAP.cn;
  dayjs.locale(targetLocale);
};

onMounted(() => {
  themeStore.initTheme();
  setDayjsLocale();
});

watch(
  () => localeStore.currentLocale,
  () => {
    setDayjsLocale();
  },
  {
    immediate: false,
    deep: false,
  },
);
</script>

<style lang="less"></style>
