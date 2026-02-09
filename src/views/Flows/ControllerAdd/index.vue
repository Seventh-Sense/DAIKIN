<template>
  <div class="card">
    <div class="card-content">
      <div class="card-top">
        <span class="card-title">
          {{ stepStore.currentMenuData.data.address }}
        </span>
        <a-button class="card-del" @click="onDelete">
          <Icons
            name="delete"
            type="mono-line"
            :size="20"
            :color="{ normal: '#ffffff' }"
          />
          {{ t("device_info.del_device") }}
        </a-button>
      </div>
      <div class="card-raw">
        <span class="card-property">主机</span>
        <span class="card-value">{{
          stepStore.currentMenuData.data.address
        }}</span>
      </div>
      <div class="card-raw">
        <span class="card-property">主机</span>
        <span class="card-value">{{
          stepStore.currentMenuData.data.address
        }}</span>
      </div>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStepStore } from "@/pinia/modules/step";
import { handleEditCompleteJump } from "../until.ts/util";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { routerTurnByName } from "../../../router/util";
import Icons from "@/icons/index.vue";

const { t } = useI18n();
const stepStore = useStepStore();

const onClick = () => {
  handleEditCompleteJump();
};

const onDelete = () => {
  try {
    const currentRawMenus = [...stepStore.rawMenus];

    let key = stepStore.currentStep.split("-")[0];

    const targetMenuIndex = currentRawMenus.findIndex(
      (item) => item.key === key,
    );

    if (targetMenuIndex === -1) {
      message.error(t("layout.msg_3"));
      return;
    }

    const deletedSubMenuKey = stepStore.currentMenuData.key;

    currentRawMenus[targetMenuIndex].children = currentRawMenus[
      targetMenuIndex
    ].children.filter((subItem: any) => subItem.key !== deletedSubMenuKey);
    stepStore.updateRawMenus(currentRawMenus);

    const newSelectedKeys = stepStore.menuSelectedKeys.filter(
      (key: any) =>
        !key.startsWith(`${deletedSubMenuKey}-`) && key !== deletedSubMenuKey,
    );
    stepStore.updateMenuSelectedKeys(newSelectedKeys);

    const newOpenKeys = stepStore.menuOpenKeys.filter(
      (key: any) => key !== deletedSubMenuKey,
    );
    stepStore.updateMenuOpenKeys(newOpenKeys);

    stepStore.updateCurrentStep("");

    routerTurnByName("Home", false, false);
  } catch (error) {
    console.error("删除菜单项失败：", error);
    message.error(t("layout.msg_1"));
  }
};
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: 100%;
  padding: 0 24px;

  &-content {
    width: 100%;
  }

  &-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
  }

  &-title {
    font-weight: bold;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
  }

  &-raw {
    height: 40px;
    display: flex;
    align-items: center;
  }

  &-btn {
    width: 74px;
    height: 32px;
    padding: 0;
    border-radius: 0;
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
  }

  &-del {
    width: 96px;
    height: 32px;
    background-color: #f76f83ff;
    border-color: #f76f83ff;
    border-radius: 0;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
    line-height: 20px;
    font-style: normal;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &-del:hover {
    border-color: #f76f83ff;
    color: #ffffff;
  }

  &-property {
    width: 200px;
    font-weight: bold;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
  }

  &-value {
    font-weight: 400;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
  }
}
</style>
