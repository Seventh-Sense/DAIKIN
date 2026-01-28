<template>
  <a-dropdown>
    <a class="ant-dropdown-link" @click.prevent>
      {{ $t('layout.locale') }}
      <DownOutlined />
    </a>
    <template #overlay>
      <a-menu @click="handleLocaleChange">
        <a-menu-item key="cn">
          {{ $t('layout.cn') }}
        </a-menu-item>
        <a-menu-item key="en">
          {{ $t('layout.en') }}
        </a-menu-item>
        <a-menu-item key="jp">
          {{ $t('layout.jp') }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { DownOutlined } from "@ant-design/icons-vue";
import { useLocaleStore } from "@/pinia/modules/locale";

const localeStore = useLocaleStore();

const handleLocaleChange = (e: { key: string }) => {
  localeStore.switchLocale(e.key)
}
</script>

<style lang="scss" scoped></style>
