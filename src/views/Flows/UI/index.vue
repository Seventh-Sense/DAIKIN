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
    <div class="card-content">
      <UICard
        v-for="(item, index) in list"
        :key="index"
        :data="item"
        @rename="handleRename"
        @edit="handleEdit"
        @delete="handleDelete"
        @preview="handlePreview"
      />
    </div>
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
import { onMounted, ref } from "vue";
import UICard from "./UICard/index.vue";

const { t } = useI18n();

const list = ref([
  {
    id: "7a3b9ff3-aaa7-4161-b263-1ed1ac0666de",
    name: "Demo",
    time: "2025-09-10T13:29:13.147261",
    type: "graphic",
  },
  {
    id: "7a3b9ff3-aaa7-4161-b263-1ed1ac0666d1",
    name: "Demo",
    time: "2025-09-10T13:29:13.147261",
    type: "graphic",
  },
  {
    id: "7a3b9ff3-aaa7-4161-b263-1ed1ac0666d2",
    name: "Demo",
    time: "2025-09-10T13:29:13.147261",
    type: "graphic",
  },
  {
    id: "7a3b9ff3-aaa7-4161-b263-1ed1ac0666d3",
    name: "Demo",
    time: "2025-09-10T13:29:13.147261",
    type: "graphic",
  },
  {
    id: "7a3b9ff3-aaa7-4161-b263-1ed1ac0666d4",
    name: "Demo",
    time: "2025-09-10T13:29:13.147261",
    type: "graphic",
  },
  {
    id: "7a3b9ff3-aaa7-4161-b263-1ed1ac0666d6",
    name: "Demo",
    time: "2025-09-10T13:29:13.147261",
    type: "graphic",
  },
]);

const onClick = () => {
  handleEditCompleteJump();
};

const handleRename = (data: any) => {
  console.log("handleRename", data);
};

const handleDelete = (data: any) => {
  console.log("handleDelete", data);
};

const handleEdit = (data: any) => {
  console.log("handleEdit", data);
};

const handlePreview = (data: any) => {
  console.log("handlePreview", data);
};
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: calc(100vh - 80px);
  padding: 0 24px;
  display: flex;
  flex-direction: column;

  &-top {
    height: 52px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

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
    overflow-y: auto;
    margin-bottom: 60px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    padding: 8px 0;
    align-content: flex-start;

    @media (max-width: 768px) {
      grid-template-columns: 1fr !important;
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

.btn-add {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 0;
}
</style>
