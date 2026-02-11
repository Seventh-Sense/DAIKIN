<template>
  <div class="card">
    <div class="card-top">
      <span class="card-top-title">{{ t("ui.title") }}</span>
      <a-button type="primary" class="btn-add">
        {{ t("ui.add") }}
        <Icons
          name="addCircle"
          type="mono-line"
          :size="20"
          :color="{ normal: '#ffffff' }"
        />
      </a-button>
    </div>
    <div class="card-content"></div>
    <div class="card-finish">
      <a-button type="primary" class="card-finish-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { handleEditCompleteJump } from "../until.ts/util";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";

const { t } = useI18n();

const onClick = () => {
  handleEditCompleteJump();
};
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: 100%;
  padding: 0 24px;

  &-top {
    height: 52px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      font-weight: bold;
      font-size: 14px;
      color: #222222;
      line-height: 20px;
      text-align: left;
      font-style: normal;
    }
  }

  &-content {
    flex: 1;
    
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

.btn-add {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 0;
}
</style>
