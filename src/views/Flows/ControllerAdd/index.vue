<template>
  <div class="card">
    <div class="card-content">
      <div class="card-top">
        <span class="card-title">
          {{ stepStore.currentMenuData.data.address }}
        </span>
        <div style="display: flex; gap: 12px">
          <template v-if="isDualLanDevice">
            <a-button class="card-set" @click="onSetNetWorkLan0">
              <Icons
                name="network"
                type="mono-line"
                :size="20"
                :color="{ normal: '#ffffff' }"
              />
              {{ t("device_info.lan0_config") }}
            </a-button>
            <a-button class="card-set" @click="onSetNetWorkLan1">
              <Icons
                name="network"
                type="mono-line"
                :size="20"
                :color="{ normal: '#ffffff' }"
              />
              {{ t("device_info.lan1_config") }}
            </a-button>
          </template>
          <template v-else>
            <a-button class="card-set" @click="onSetNetWork">
              <Icons
                name="network"
                type="mono-line"
                :size="20"
                :color="{ normal: '#ffffff' }"
              />
              {{ t("device_info.modify_device_address") }}
            </a-button>
          </template>
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
      </div>
      <div class="card-raw">
        <span class="card-property">{{ t("device_search.name") }}</span>
        <span class="card-value">
          {{ stepStore.currentMenuData.data.name }}
        </span>
      </div>
      <div class="card-raw">
        <span class="card-property">{{ t("device_search.slave_id") }}</span>
        <span class="card-value">
          {{ stepStore.currentMenuData.data.slaveid }}
        </span>
      </div>
      <div class="card-raw">
        <span class="card-property">{{ t("device_search.address") }}</span>
        <span class="card-value">
          {{ stepStore.currentMenuData.data.address }}
        </span>
      </div>
      <div class="card-raw">
        <span class="card-property">{{ t("device_search.version") }}</span>
        <span class="card-value">
          {{ stepStore.currentMenuData.data.version }}
        </span>
      </div>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
    <NetworkSetModal
      v-if="modalVisible"
      v-model:modelShow="modalVisible"
      :fileName="ethFileName"
    />
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
        {{ t("layout.is_confirm") }} "{{
          stepStore.currentMenuData.data.address
        }}"
        {{ t("layout.this_menu") }}
      </p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { useStepStore } from "@/pinia/modules/step";
import { handleEditCompleteJump } from "../until/util";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { routerTurnByName } from "../../../router/util";
import Icons from "@/icons/index.vue";
import { ref, computed } from "vue";
import { useControllerStore } from "@/pinia/modules/controller";
import NetworkSetModal from "./Modal/NetworkSetModal/index.vue";

const { t } = useI18n();
const stepStore = useStepStore();
const controllerStore = useControllerStore();

const deleteModalVisible = ref(false);
const deleteSubMenuName = ref("");
const modalVisible = ref(false);
const ethFileName = ref("eth.json");

// 判断是否是特殊设备（支持双网口）
const isDualLanDevice = computed(() => {
  const deviceName = stepStore.currentMenuData.data?.name;
  return deviceName === "TIZI-3432-C020" || deviceName === "TIZI-3432-C040";
});
const onClick = () => {
  handleEditCompleteJump();
};

const onDelete = () => {
  deleteModalVisible.value = true;
};

const confirmDelete = () => {
  try {
    const currentRawMenus = [...stepStore.rawMenus];

    let key = stepStore.currentStep.split("-")[0];

    controllerStore.deleteControllerByIp(
      stepStore.currentMenuData.data.address,
    );

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

//网络设置 - LAN0
const onSetNetWorkLan0 = () => {
  ethFileName.value = "eth.json";
  modalVisible.value = true;
};

//网络设置 - LAN1
const onSetNetWorkLan1 = () => {
  ethFileName.value = "eth1.json";
  modalVisible.value = true;
};

//网络设置（兼容旧逻辑）
const onSetNetWork = () => {
  ethFileName.value = "eth.json";
  modalVisible.value = true;
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
    height: 32px;
    background-color: #f76f83ff;
    border-color: #f76f83ff;
    border-radius: 0;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
    line-height: 20px;
    font-style: normal;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &-del:hover {
    border-color: #f76f83ff;
    color: #ffffff;
  }

  &-set {
    height: 32px;
    background-color: #0097E0FF;
    border-color: #0097E0FF;
    border-radius: 0;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
    line-height: 20px;
    font-style: normal;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &-set:hover {
    border-color: #0097E0FF;
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
    text-align: right;
    font-style: normal;
  }
}
</style>
