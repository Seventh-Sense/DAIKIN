<template>
  <div class="card">
    <div class="card-top">
      <span class="card-top-title">{{ t("mqtt.title") }}</span>
      <div class="card-top-actions">
        <a-button type="primary" class="card-btn" @click="onImport">
          {{ t("ui.import") }}
        </a-button>
        <a-button type="primary" class="card-btn" @click="onExport">
          {{ t("ui.export") }}
        </a-button>
      </div>
    </div>
    <div class="card-content">
      <MqttConfigForm ref="mqttForm" />
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { handleEditCompleteJump } from "../until/util";
import MqttConfigForm from "./MqttConfigForm.vue";
import { exportMqttData, importMqttData } from "./utils/xlsx";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";

const { t } = useI18n();
const controllerStore = useControllerStore();
const stepStore = useStepStore();

const mqttForm = ref<InstanceType<typeof MqttConfigForm> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const currentIP = stepStore.getCurrentIP();

const onClick = () => {
  if (mqttForm.value && !mqttForm.value.validate()) return;

  handleEditCompleteJump();
};

// ========== 导出 ==========
const onExport = () => {
  const ctrl = controllerStore.getControllerByIp(currentIP);
  exportMqttData(ctrl?.mqtt || {});
};

// ========== 导入 ==========
const onImport = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  try {
    await importMqttData(file, applyImportedData);
  } catch (error) {
    console.error("MQTT 导入失败:", error);
  } finally {
    input.value = "";
  }
};

const applyImportedData = (mqtt: Record<string, any>) => {
  const ctrl = controllerStore.getControllerByIp(currentIP);
  if (!ctrl) {
    message.error(t("mqtt.controller_not_found"));
    return;
  }

  // 直接替换 mqtt 对象
  ctrl.mqtt = mqtt;

  // 刷新表单
  mqttForm.value?.refresh();
};
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: calc(100vh - 80px);
  padding: 0 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  &-top {
    height: 52px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    &-title {
      font-weight: bold;
      font-size: 14px;
      color: var(--header-text-color);
      line-height: 20px;
      text-align: left;
      font-style: normal;
    }

    &-actions {
      display: flex;
      gap: 8px;
    }
  }

  &-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    margin-bottom: 60px;
    max-height: calc(100% - 60px);
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
}

:deep(.ant-input) {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--header-text-color);
  padding-left: 0;
}

:deep(.ant-input:focus) {
  box-shadow: none;
}

:deep(.ant-input-password) {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--header-text-color);
  padding-left: 0;
}

:deep(.ant-input:focus, .ant-input-password:focus),
:deep(.ant-input-password:focus-within) {
  border-color: var(--header-text-color) !important;
  box-shadow: none !important;
  outline: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

:deep(.ant-select) {
  border-bottom: 1px solid var(--header-text-color);
  box-shadow: none !important;
  outline: none !important;

  .ant-select-selector {
    border: 0 !important;
    box-shadow: none !important;
    background-color: transparent !important;
    padding-left: 0;

    &:focus,
    &:hover,
    &.ant-select-selection-active {
      border-color: transparent !important;
      box-shadow: none !important;
      outline: none !important;
    }
  }
}

:deep(.ant-input-number) {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--header-text-color);
  padding-left: 0;
  background-color: transparent !important;
}

:deep(.ant-input-number:focus),
:deep(.ant-input-number-focused),
:deep(.ant-input-number:hover) {
  border-color: var(--header-text-color) !important;
  box-shadow: none !important;
  outline: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

:deep(.ant-input-number-input) {
  padding-left: 0;
  background-color: transparent !important;
}
</style>
