<template>
  <div class="sider">
    <div class="sider-top"></div>
    <a-menu v-model:selectedKeys="selectedKeys" mode="inline">
      <a-menu-item
        v-for="(menu, index) in menus"
        :key="index + 1"
        @click="handleClick(menu, index)"
      >
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
import { computed, ref, watch } from "vue";
import Icons from "@/icons/index.vue";
import { useI18n } from "vue-i18n";
import { routerTurnByPath } from "@/router/util";
import { useStepStore } from "@/pinia/modules/step";
import { useRoute } from "vue-router";

const stepStore = useStepStore();
const route = useRoute();

const { t } = useI18n();
const selectedKeys = ref<number[]>([stepStore.currentStep]);

const menus = computed(() => [
  {
    icon: "deviceA",
    label: t("layout.flow_1"),
    path: "/home",
  },
  {
    icon: "refresh",
    label: t("layout.flow_2"),
    path: "/home/firmwareupdate",
  },
  {
    icon: "addCircle",
    label: t("layout.flow_3"),
    path: "/home/devices",
  },
  {
    icon: "setting",
    label: t("layout.flow_4"),
    path: "/home/mqtt",
  },
  {
    icon: "multistate",
    label: t("layout.flow_5"),
    path: "/home/ui",
  },
  {
    icon: "checkCircle",
    label: t("layout.flow_6"),
    path: "/home/check",
  },
]);

const handleClick = (menu: any, index: number) => {
  const step = index + 1;

  selectedKeys.value = [step];

  stepStore.updateCurrentStep(step);
  //console.log(menu, selectedKeys.value);

  if (menu.path) {
    routerTurnByPath(menu.path);
  }
};

watch(
  () => route.path,
  (newPath) => {
    const menuIndex = menus.value.findIndex(menu => menu.path === newPath);
    if (menuIndex !== -1) {
      const step = menuIndex + 1;
      selectedKeys.value = [step];
      stepStore.updateCurrentStep(step);
    }
  },
  { immediate: true }
);
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
  color: var(--sider-text-color);
  line-height: 48px;
  text-align: left;
  font-style: normal;
}

:deep(.ant-menu-item) {
  padding-left: 12px !important;
  width: 100% !important;
  height: 48px;
  margin: 0;
  border-top: 1px solid var(--sider-menu-border-color);
  border-radius: 0;
}

:deep(.ant-menu > .ant-menu-item:last-child) {
  border-bottom: 1px solid var(--sider-menu-border-color);
}

:deep(.ant-menu-item-selected) {
  background-color: var(--sider-menu-select-color);
  border-radius: 0;
}

:deep(.ant-menu-item:active) {
  background-color: var(--sider-menu-select-color);
  border-radius: 0;
}

:deep(.ant-menu-item-selected) .nav-text {
  font-weight: bold !important;
  color: var(--sider-menu-select-font-color) !important;
}
</style>
