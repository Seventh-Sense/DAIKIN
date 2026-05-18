<template>
  <div class="sider">
    <div class="sider-top">
      <img src="@/assets/adveco.png" width="128" height="27" alt="" />
    </div>
    <div class="menu-wrapper">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        class="custom-menu"
      >
        <!-- 渲染一级菜单 -->
        <a-sub-menu v-for="(menu, index) in stepStore.menus" :key="menu.key">
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
                type="mono-line"
                :size="24"
                :color="{ normal: '#22222299' }"
                @click.stop="handleRightIconClick(menu)"
              />
            </div>
          </template>
          <!-- 一级菜单有子菜单：渲染二级菜单 -->
          <template v-if="menu.children && menu.children.length">
            <a-sub-menu
              v-for="(subMenu, subIndex) in menu.children"
              :key="subMenu.key"
              class="second-submenu"
              @click.prevent="handleSecondMenuClick(subMenu)"
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
                  <div class="second-menu-title-front">
                    <Icons
                      :name="subMenu.icon"
                      :size="20"
                      :color="{ normal: '#22222299' }"
                    />
                    <span class="menu-title">
                      {{ subMenu.label }}
                    </span>
                  </div>
                  <div class="delete-icon-wrapper">
                    <Icons
                      name="delete"
                      :size="20"
                      :color="{ normal: '#22222299' }"
                      @click.stop="() => handleDeleteSubMenu(menu, subMenu)"
                    />
                  </div>
                </div>
              </template>
              <!-- 二级菜单有子菜单：渲染三级可点击菜单（唯一保留点击事件） -->
              <template v-if="subMenu.children && subMenu.children.length">
                <a-menu-item
                  v-for="(item, itemIndex) in subMenu.children"
                  :key="item.key"
                  @click.stop="handleClick(item, subMenu)"
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
    <a-modal
      v-model:open="deleteModalVisible"
      :title="t('layout.confirm_delete')"
      :closable="false"
      :maskClosable="false"
      :ok-text="t('layout.confirm')"
      :cancel-text="t('layout.cancel')"
      @ok="confirmDelete"
      @cancel="deleteModalVisible = false"
    >
      <p>
        {{ t("layout.is_confirm") }} "{{ deleteSubMenuName }}"
        {{ t("layout.this_menu") }}
      </p>
    </a-modal>
    <ControllersSearch
      v-if="showModal"
      v-model:modelShow="showModal"
      :type="clickType"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Icons from "@/icons/index.vue";
import { routerTurnByPath } from "@/router/util";
import { useStepStore } from "@/pinia/modules/step";
import ControllersSearch from "@/components/Modal/ControllersSearch/index.vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { routerTurnByName } from "../../../router/util";
import { downloadFile } from "@/api/modules/page";
import { useControllerStore } from "@/pinia/modules/controller";
import { DeviceInitData } from "@/views/Flows/until/template";
import {
  controllerFileName,
  unzipAndReadConfig,
} from "@/views/Flows/ConnectCheck/until";

const controllerStore = useControllerStore();

const { t } = useI18n();
const stepStore = useStepStore();

const showModal = ref(false);

const selectedKeys = computed({
  get() {
    return stepStore.menuSelectedKeys.length
      ? stepStore.menuSelectedKeys
      : typeof stepStore.currentStep === "string"
        ? [stepStore.currentStep]
        : [];
  },
  set(newVal) {
    stepStore.updateMenuSelectedKeys(newVal);
  },
});

const openKeys = computed({
  get() {
    return stepStore.menuOpenKeys.length ? stepStore.menuOpenKeys : [];
  },
  set(newVal) {
    stepStore.updateMenuOpenKeys(newVal);
  },
});

//删除弹窗相关状态
const deleteModalVisible = ref(false); // 删除弹窗显示状态
const deleteTargetMenu = ref<any>(null); // 要删除的一级菜单
const deleteTargetSubMenu = ref<any>(null); // 要删除的二级菜单
const deleteSubMenuName = ref(""); // 要删除的菜单项名称

const clickType = ref("1");

const handleRightIconClick = (menu: any) => {
  clickType.value = menu.key;
  showModal.value = true;
};

const handleClick = (menu: any, secondMenu: any) => {
  selectedKeys.value = [menu.key];
  stepStore.updateCurrentStep(menu.key);

  if (menu.path) {
    //存储当前点击项的二级菜单数据
    stepStore.updateCurrentMenuData(secondMenu);
    routerTurnByPath(menu.path + "/" + secondMenu.label);
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

const handleDeleteSubMenu = (menu: any, subMenu: any) => {
  deleteTargetMenu.value = menu; // 保存一级菜单
  deleteTargetSubMenu.value = subMenu; // 保存二级菜单
  deleteSubMenuName.value = subMenu.label; // 保存菜单项名称（用于弹窗提示）
  deleteModalVisible.value = true; // 打开确认弹窗
};

const confirmDelete = () => {
  try {
    const currentRawMenus = [...stepStore.rawMenus];

    const targetMenuIndex = currentRawMenus.findIndex(
      (item) => item.key === deleteTargetMenu.value.key,
    );

    if (targetMenuIndex === -1) {
      message.error(t("layout.msg_3"));
      deleteModalVisible.value = false;
      return;
    }

    const deletedSubMenuKey = deleteTargetSubMenu.value.key;
    currentRawMenus[targetMenuIndex].children = currentRawMenus[
      targetMenuIndex
    ].children.filter((subItem: any) => subItem.key !== deletedSubMenuKey);

    stepStore.updateRawMenus(currentRawMenus);

    //清理选中/展开状态
    const newSelectedKeys = stepStore.menuSelectedKeys.filter(
      (key: any) =>
        !key.startsWith(`${deletedSubMenuKey}-`) && key !== deletedSubMenuKey,
    );
    stepStore.updateMenuSelectedKeys(newSelectedKeys);

    const newOpenKeys = stepStore.menuOpenKeys.filter(
      (key: any) => key !== deletedSubMenuKey,
    );
    stepStore.updateMenuOpenKeys(newOpenKeys);

    // 判断是否需要跳转到首页
    const needRedirectToHome =
      stepStore.currentStep === deletedSubMenuKey ||
      (typeof stepStore.currentStep === "string" &&
        stepStore.currentStep.startsWith(`${deletedSubMenuKey}-`));

    if (needRedirectToHome) {
      stepStore.updateCurrentStep("");
      routerTurnByName("Home", false, false);
    }

    message.success(
      t("layout.msg_2", {
        name: deleteSubMenuName.value,
      }),
    );
    deleteModalVisible.value = false;

    controllerStore.deleteControllerByIp(deleteSubMenuName.value)

    // 重置删除相关状态
    deleteTargetMenu.value = null;
    deleteTargetSubMenu.value = null;
    deleteSubMenuName.value = "";
  } catch (error) {
    console.error("删除菜单项失败：", error);
    message.error(t("layout.msg_1"));
    deleteModalVisible.value = false;
  }
};

const handleSecondMenuClick = async (subMenu: any) => {
  //二级菜单展开，拉取设备信息
  if (openKeys.value.includes(subMenu.key)) {
    console.log("二级菜单已展开 →", subMenu.label);
    controllerStore.setCurrentAdress(subMenu.label)
    pullControllerFile(subMenu.label);
  }
};

const pullControllerFile = async (ip: string) => {
  if (!ip || !ip.trim()) {
    console.error("控制器 IP 不能为空");
    return;
  }

  try {
    const result = await downloadFile(ip, controllerFileName);

    const hasValidData =
      result &&
      result.data &&
      typeof result.data === "string" &&
      Number(result.file_size) > 0;

    if (!hasValidData) {
      console.log(`[${ip}] 文件为空，使用默认配置`);
      controllerStore.addController(ip, { ...DeviceInitData });
      return;
    }

    const config = await unzipAndReadConfig(result);

    controllerStore.addController(ip, config);
    //console.log(ip, config);
  } catch (e) {
    controllerStore.addController(ip, { ...DeviceInitData });

    const errMsg = (e as any)?.response?.data?.detail || t("msg.unknown_error");
    message.error(`${t("msg.load_control_config_fail")}: ${errMsg}`);
    console.error("无法获取控制器信息", e);
  }
};
</script>

<style lang="less" scoped>
.sider {
  height: 100%;
  display: flex;
  flex-direction: column;

  &-top {
    display: flex;
    justify-content: center;
    align-items: center;
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

.delete-icon-wrapper {
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.second-menu-title:hover .delete-icon-wrapper {
  opacity: 1;
  visibility: visible;
  display: flex;
  align-items: center;
}

.second-menu-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 32px;
  gap: 4px;
}

.second-menu-title-front {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
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

  .menu-title,
  .menu-title-1 {
    font-weight: bold !important;
    color: var(--sider-menu-select-font-color) !important;
  }
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
