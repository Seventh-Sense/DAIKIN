<template>
  <div class="card">
    <div class="card-top">{{ t("mqtt.title") }}</div>
    <div class="card-content">
      <a-tabs v-model:activeKey="activeKey" class="mqtt-tabs">
        <a-tab-pane :key="'mqtt'" :tab="t('mqtt.tab_mqtt1')">
          <MqttConfigForm ref="mqttForm1" mqtt-key="mqtt" />
        </a-tab-pane>
        <a-tab-pane :key="'mqtt2'" :tab="t('mqtt.tab_mqtt2')">
          <MqttConfigForm ref="mqttForm2" mqtt-key="mqtt2" />
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { handleEditCompleteJump } from "../until/util";
import MqttConfigForm from "./MqttConfigForm.vue";

const { t } = useI18n();

const activeKey = ref("mqtt");
const mqttForm1 = ref<InstanceType<typeof MqttConfigForm> | null>(null);
const mqttForm2 = ref<InstanceType<typeof MqttConfigForm> | null>(null);

const onClick = () => {
  if (mqttForm1.value && !mqttForm1.value.validate()) return;
  if (mqttForm2.value && !mqttForm2.value.validate()) return;

  handleEditCompleteJump();
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
    align-items: center;
    font-weight: bold;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
    flex-shrink: 0;
  }

  &-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 60px;
    max-height: calc(100% - 60px);

    :deep(.ant-tabs) {
      flex: 1;
      display: flex;
      flex-direction: column;

      .ant-tabs-content-holder {
        flex: 1;
        overflow: hidden;

        .ant-tabs-content {
          height: 100%;

          .ant-tabs-tabpane {
            height: 100%;
          }
        }
      }
    }
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

:deep(.ant-tabs-tab) {
  color: var(--header-text-color) !important;
}

:deep(.ant-tabs-tab-active) {
  font-weight: bold !important;
}

:deep(.ant-tabs-ink-bar) {
  background-color: var(--header-text-color) !important;
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
