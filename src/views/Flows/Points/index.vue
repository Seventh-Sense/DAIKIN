<template>
  <div class="card" ref="cardRef">
    <div class="card-top">
      <Icons
        name="arrowLeft"
        type="mono-line"
        :size="28"
        :color="{ normal: '#222222FF' }"
        @click="onBack"
      />
      <span class="card-top-title">
        {{ t("device_manage.p_title") }}
      </span>
    </div>
    <div class="card-actions"></div>
    <div class="card-finish">
      <a-button type="primary" class="card-finish-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { handleEditCompleteJump } from "../until/util";
import Icons from "@/icons/index.vue";

const { t } = useI18n();

const onBack = () => {
  window.history.back();
};

const onClick = () => {
  handleEditCompleteJump();
};
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: calc(100vh - 80px);
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  &-top {
    height: 52px;
    display: flex;
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
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;

    &-btn {
      width: 74px;
      height: 32px;
      padding: 0;
      border-radius: 0;
    }
  }
}
</style>
