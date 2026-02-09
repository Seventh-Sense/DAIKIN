<template>
  <div class="card">
    <div class="card-content">
      <div class="card-title">{{ stepStore.currentMenuData.data.address }}</div>
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

const { t } = useI18n();
const stepStore = useStepStore();

const onClick = () => {
  handleEditCompleteJump();
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

  &-title {
    height: 52px;
    font-weight: bold;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
    display: flex;
    align-items: center;
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
