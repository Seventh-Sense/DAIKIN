<template>
  <div class="sider">
    <div class="sider-top"></div>
    <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
      <a-menu-item v-for="(menu, index) in menus" :key="index + 1">
        <template #icon>
          <template v-if="selectedKeys.includes(index + 1)">
            <Icons
              :name="menu.icon"
              :size="24"
              :color="{ normal: '#22222299', active: '#00A0E4FF' }"
            />
          </template>
          <template v-else>
            <Icons
              :name="menu.icon"
              type="mono-line"
              :size="24"
              :color="{ normal: '#22222299' }"
            />
          </template>
        </template>
        <span class="nav-text">{{ menu.label }}</span>
      </a-menu-item>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Icons from "@/icons/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const selectedKeys = ref<number[]>([4]);

const menus = computed(() => [
  {
    icon: "deviceA",
    label: t("layout.flow_1"),
  },
  {
    icon: "refresh",
    label: t("layout.flow_2"),
  },
  {
    icon: "addCircle",
    label: t("layout.flow_3"),
  },
  {
    icon: "setting",
    label: t("layout.flow_4"),
  },
  {
    icon: "multistate",
    label: t("layout.flow_5"),
  },
  {
    icon: "checkCircle",
    label: t("layout.flow_6"),
  },
]);
</script>

<style lang="less" scoped>
.sider {
  &-top {
    height: 80px;
  }
}

.nav-text {
  font-weight: 400;
  font-size: 16px;
  color: rgba(34, 34, 34, 0.6);
  line-height: 40px;
  text-align: left;
  font-style: normal;
}

:deep(.ant-menu-item) {
  padding-left: 12px !important;
}

:deep(.ant-menu-item-selected) {
  background-color: #e2f2fcff;
}

:deep(.ant-menu-item:active) {
  background-color: #e2f2fcff !important;
}

:deep(.ant-menu-item-selected) .nav-text {
  font-weight: bold !important;
  color: #222222 !important;
}
</style>
