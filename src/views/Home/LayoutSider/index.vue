<template>
  <div class="sider">
    <div class="sider-top"></div>
    <div class="menu-wrapper">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        class="custom-menu"
      >
        <!-- 渲染一级菜单 -->
        <a-sub-menu v-for="(menu, index) in menus" :key="menu.key">
          <template #icon>
            <Icons
              :name="menu.icon"
              :size="24"
              :color="{ normal: '#22222299', active: '#00A0E4FF' }"
            />
          </template>
          <template #title>
            <div
              class="menu-title-wrapper"
              :class="{ highlight: isMenuHighlighted(menu.key) }"
            >
              <span class="menu-title">{{ menu.label }}</span>
              <Icons
                name="addCircle"
                type="color-white"
                :size="24"
                :color="{ normal: '#00A0E4FF' }"
                @click.stop="handleRightIconClick(menu)"
              />
            </div>
          </template>
          <!-- 一级菜单有子菜单：渲染二级菜单 -->
          <template v-if="menu.children && menu.children.length">
            <a-sub-menu
              v-for="(subMenu, subIndex) in menu.children"
              :key="subMenu.key"
            >
              <template #icon>
                <Icons
                  :name="
                    openKeys.includes(subMenu.key) ? 'arrowDown' : 'arrowRight'
                  "
                  :size="20"
                  :color="{ normal: '#22222299' }"
                />
              </template>
              <template #title>
                <div
                  class="second-menu-title"
                  :class="{ highlight: isMenuHighlighted(subMenu.key) }"
                >
                  <Icons
                    :name="subMenu.icon"
                    :size="20"
                    :color="{ normal: '#22222299' }"
                  />
                  <span class="menu-title">
                    {{ subMenu.label }}
                  </span>
                </div>
              </template>
              <!-- 二级菜单有子菜单：渲染三级可点击菜单（唯一保留点击事件） -->
              <template v-if="subMenu.children && subMenu.children.length">
                <a-menu-item
                  v-for="(item, itemIndex) in subMenu.children"
                  :key="item.key"
                  @click="handleClick(item)"
                >
                  <template #icon>
                    <Icons
                      :name="item.icon"
                      :size="20"
                      :color="{ normal: '#22222299' }"
                    />
                  </template>
                  <span class="menu-title-1">{{ item.label }}</span>
                </a-menu-item>
              </template>
            </a-sub-menu>
          </template>
        </a-sub-menu>
      </a-menu>
    </div>
    <ControllersSearch v-if="showModal" v-model:modelShow="showModal"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Icons from "@/icons/index.vue";
import { useI18n } from "vue-i18n";
import { routerTurnByPath } from "@/router/util";
import { useStepStore } from "@/pinia/modules/step";
import { useRoute } from "vue-router";
import ControllersSearch from "@/components/Modal/ControllersSearch/index.vue"

const stepStore = useStepStore();
const route = useRoute();

const { t } = useI18n();

const showModal = ref(false)

const initSelectedKey = stepStore.menuSelectedKeys.length
  ? stepStore.menuSelectedKeys
  : typeof stepStore.currentStep === "string"
    ? [stepStore.currentStep]
    : [];

const initOpenKeys = stepStore.menuOpenKeys.length
  ? stepStore.menuOpenKeys
  : [];

const selectedKeys = ref<string[]>(initSelectedKey);
const openKeys = ref<string[]>(initOpenKeys);

// 监听选中状态变化，同步到store
watch(
  selectedKeys,
  (newVal) => {
    stepStore.updateMenuSelectedKeys(newVal);
  },
  { immediate: true, deep: true },
);

// 监听展开状态变化，同步到store
watch(
  openKeys,
  (newVal) => {
    stepStore.updateMenuOpenKeys(newVal);
  },
  { immediate: true, deep: true },
);

const menus = computed(() => [
  {
    key: "1",
    icon: "deviceA",
    label: t("layout.professional"),
    children: [
      {
        key: "1-1",
        icon: "deviceA",
        label: "192.168.10.9",
        children: [
          {
            key: "1-1-1",
            icon: "deviceA",
            label: t("layout.flow_1"),
            path: "/home",
          },
          {
            key: "1-1-2",
            icon: "refresh",
            label: t("layout.flow_2"),
            path: "/home/firmwareupdate",
          },
          {
            key: "1-1-3",
            icon: "addCircle",
            label: t("layout.flow_3"),
            path: "/home/devices",
          },
          {
            key: "1-1-4",
            icon: "setting",
            label: t("layout.flow_4"),
            path: "/home/mqtt",
          },
          {
            key: "1-1-5",
            icon: "multistate",
            label: t("layout.flow_5"),
            path: "/home/ui",
          },
          {
            key: "1-1-6",
            icon: "checkCircle",
            label: t("layout.flow_6"),
            path: "/home/check",
          },
        ],
      },
      {
        key: "1-2",
        icon: "deviceA",
        label: "192.168.10.10",
      },
    ],
  },
  {
    key: "2",
    icon: "deviceA",
    label: t("layout.standard"),
    children: [],
  },
  {
    key: "3",
    icon: "deviceA",
    label: t("layout.lite"),
    children: [
      {
        key: "3-1",
        icon: "deviceA",
        label: "192.168.10.10",
      },
    ],
  },
]);

const handleRightIconClick = (menu: any) => {
  showModal.value = true
};

const handleClick = (menu: any) => {
  selectedKeys.value = [menu.key];
  stepStore.updateCurrentStep(menu.key);

  if (menu.path) {
    routerTurnByPath(menu.path);
  }
};

// 计算属性：获取当前选中项的所有上级key
const parentKeysOfSelected = computed(() => {
  // 1. 校验targetKey是否为有效字符串
  const targetKey = selectedKeys.value[0];
  if (!targetKey || typeof targetKey !== "string") return [];

  // 2. 解析上级key（仅当包含"-"时才解析）
  if (!targetKey.includes("-")) return [];

  // 3. 安全解析上级key
  const keyParts = targetKey.split("-");
  return keyParts
    .map((_, index) => {
      return keyParts.slice(0, index + 1).join("-");
    })
    .slice(0, -1); // 排除自身，只保留上级
});

// 判断某个菜单key是否需要高亮（是选中项的上级）
const isMenuHighlighted = (key: string) => {
  return parentKeysOfSelected.value.includes(key);
};
</script>

<style lang="less" scoped>
.sider {
  height: 100%;
  display: flex;
  flex-direction: column;

  &-top {
    height: 80px;
  }
}

.menu-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.menu-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.second-menu-title {
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  gap: 4px;
}

.menu-title {
  font-weight: 400;
  font-size: 14px;
  color: var(--sider-text-color);
  line-height: 20px;
  text-align: left;
  font-style: normal;
}

.menu-title-1 {
  font-weight: 400;
  font-size: 12px;
  color: var(--sider-text-color);
  line-height: 17px;
  text-align: left;
  font-style: normal;
}

:deep(.custom-menu .ant-menu-submenu-arrow) {
  display: none !important;
}
// 给一级菜单的最后一个子菜单标题添加下边框
:deep(.ant-menu) {
  height: 100%;
  border-right: none;
}

:deep(.ant-menu-item) {
  padding-left: 12px !important;
  width: 100% !important;
  height: 32px;
  line-height: 32px !important;
  margin: 0;
  border-radius: 0;
  background-color: var(--header-bg);
}
// 一级菜单样式
:deep(.ant-menu-submenu > .ant-menu-submenu-title) {
  padding-left: 12px !important;
  padding-right: 12px !important;
  margin: 0;
  width: 100% !important;
  height: 48px !important;
  line-height: 48px !important;
  border-radius: 0;
  border-top: 1px solid var(--sider-menu-border-color);
  border-bottom: 1px solid var(--sider-menu-border-color);
}
// 二级菜单样式
:deep(
  .ant-menu-submenu > .ant-menu > .ant-menu-submenu > .ant-menu-submenu-title
) {
  padding-left: 18px !important;
  background-color: var(--header-bg);
  border: none !important;
  height: 32px !important;
  line-height: 32px !important;
}
// 二级菜单 ant-menu-title-content
:deep(
  .ant-menu-submenu
    > .ant-menu
    > .ant-menu-submenu
    > .ant-menu-submenu-title
    .ant-menu-title-content
) {
  margin-left: 0 !important;
}
// 三级菜单样式
:deep(
  .ant-menu-submenu > .ant-menu > .ant-menu-submenu > .ant-menu > .ant-menu-item
) {
  padding-left: 48px !important;
  border: none !important;
}

:deep(.ant-menu-item-selected) {
  background-color: var(--sider-menu-select-color);
  border-radius: 0;
}

:deep(.ant-menu-item:active) {
  background-color: var(--sider-menu-select-color);
  border-radius: 0;
}

:deep(.ant-menu-item-selected) .menu-title {
  font-weight: bold !important;
  color: var(--sider-menu-select-font-color) !important;
}

.highlight {
  .menu-title {
    font-weight: bold !important;
    color: var(--sider-menu-select-font-color) !important;
  }
}
</style>
