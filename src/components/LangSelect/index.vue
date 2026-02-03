<template>
  <a-dropdown>
    <span class="lang" @click.prevent>
      {{ currentLocaleName }}
      <DownOutlined />
    </span>
    <template #overlay>
      <a-menu @click="handleLocaleChange">
        <a-menu-item key="cn">
          {{ $t("layout.cn") }}
        </a-menu-item>
        <a-menu-item key="en">
          {{ $t("layout.en") }}
        </a-menu-item>
        <a-menu-item key="jp">
          {{ $t("layout.jp") }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { DownOutlined } from "@ant-design/icons-vue";
import { useLocaleStore } from "@/pinia/modules/locale";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n();

const localeStore = useLocaleStore();

const currentLocaleName = computed(() => {
  const localeNameMap: any = {
    cn: t("layout.cn"), // 对应中文名称
    en: t("layout.en"), // 对应英文名称
    jp: t("layout.jp"), // 对应日文名称
  };

  return localeNameMap[localeStore.currentLocale] || localeNameMap.cn;
});

const handleLocaleChange = (e: { key: string }) => {
  localeStore.switchLocale(e.key);
};
</script>

<style lang="less" scoped>
.lang {
  font-weight: bold;
  font-size: 14px;
  color: var(--header-text-color);
  line-height: 20px;
  text-align: center;
  font-style: normal;
}
</style>
