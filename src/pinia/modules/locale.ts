import { defineStore } from "pinia";
import { ref } from "vue";

export type LocaleType = "cn" | "en" | "jp";

export const useLocaleStore = defineStore(
  "locale",
  () => {
    // 状态：当前语言（默认中文）
    const currentLocale = ref<string>("cn");

    // 动作：切换语言
    const switchLocale = (locale: string) => {
      currentLocale.value = locale;

      const i18n = window.$i18n;
      if (i18n) {
        i18n.global.locale.value = locale as LocaleType;
      }
    };

    return {
      currentLocale,
      switchLocale,
    };
  },
  {
    persist: {
      key: "admin-locale",
      storage: localStorage,
      paths: ["currentLocale"],
    } as any,
  },
);
