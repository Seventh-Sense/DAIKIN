<template>
  <div class="card">
    <div class="card-top">
      <span class="card-top-title">{{ t("ui.title") }}</span>
      <!-- <a-button type="primary" class="btn-add" @click="onAdd">
        {{ t("ui.add") }}
        <Icons
          name="addCircle"
          type="mono-line"
          :size="20"
          :color="{ normal: '#ffffff' }"
        />
      </a-button> -->
    </div>
    <div class="card-content">
      <UICard
        v-for="(item, index) in list"
        :key="item.id"
        :data="item"
        @rename="handleRename"
        @edit="handleEdit"
        @delete="handleDelete"
        @preview="handlePreview"
      />
    </div>
    <div class="card-finish">
      <!-- <a-button type="primary" class="card-finish-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button> -->
    </div>
    <CreateModal
      v-if="showModal"
      v-model:modelShow="showModal"
      @add="handleAddNewItem"
    />
    <RenameModal
      v-if="renameShow"
      v-model:modelShow="renameShow"
      :item-id="currentRenameItem.id"
      :current-name="currentRenameItem.name"
      @confirmRename="handleConfirmRename"
    />
  </div>
</template>

<script setup lang="ts">
import { handleEditCompleteJump } from "../until/util";
import { useI18n } from "vue-i18n";
import { onMounted, ref } from "vue";
import UICard from "./UICard/index.vue";
import RenameModal from "./RenameModal/index.vue";
import CreateModal from "./CreateModal/index.vue";
import { message } from "ant-design-vue";
import { useStepStore } from "@/pinia/modules/step";
import { useLocaleStore } from "@/pinia/modules/locale";

const { t } = useI18n();

const localeStore = useLocaleStore();
const stepStore = useStepStore();

const list = ref([
  {
    id: "1",
    name: "Dashboard",
    time: "2025-09-10T13:29:13.147261",
    type: "Dashboard",
  },
  {
    id: "2",
    name: "Graphic",
    time: "2025-09-10T13:29:13.147261",
    type: "Graphic",
  },
]);

const showModal = ref(false);
const renameShow = ref(false);

const currentRenameItem = ref({
  id: "",
  name: "",
});

const onClick = () => {
  handleEditCompleteJump();
};

const onAdd = () => {
  showModal.value = true;
};

const handleAddNewItem = (newItem: any) => {
  // 将新项添加到列表开头（也可以用 push 添加到末尾）
  list.value.unshift(newItem);
  // 或者添加到末尾：list.value.push(newItem);
  message.success(t("ui.add_success"));
};

const handleRename = (data: any) => {
  currentRenameItem.value = {
    id: data.id,
    name: data.name,
  };

  renameShow.value = true;
};

const handleConfirmRename = (payload: { id: string; newName: string }) => {
  const { id, newName } = payload;
  // 找到对应卡片并更新名称
  const targetItem = list.value.find((item) => item.id === id);
  if (targetItem) {
    targetItem.name = newName;
    // 提示重命名成功（可选）
    message.success(t("ui.rename_success"));
  } else {
    message.error(t("ui.rename_fail"));
  }
};

const handleDelete = (data: any) => {
  console.log("handleDelete", data);
};

let prduction = true;

//http://192.168.10.85:9090/#/graphic/cc47b6d6-d1c8-410b-b8d7-02ad25bf64ef
const handleEdit = (data: any) => {
  console.log("handleEdit", data);
  //设备IP
  const currentLocale = localeStore.currentLocale;
  const IP = stepStore.getCurrentIP();

  let name = window.location.hostname;
  let port = window.location.port;

  if (prduction) {
    if (data.type === "Dashboard") {
      window.open(
        `http://${name}:${port}/editor/#/chart/home/1/${IP}/${currentLocale}`,
        "_blank",
      );
    } else {
      window.open(
        `http://${name}:${port}/editor/#/graphic/2/${IP}/${currentLocale}`,
        "_blank",
      );
    }
  } else {
    if (data.type === "Dashboard") {
      window.open(
        `http://${name}:5173/#/chart/home/1/${IP}/${currentLocale}`,
        "_blank",
      );
    } else {
      window.open(
        `http://${name}:5173/#/graphic/2/${IP}/${currentLocale}`,
        "_blank",
      );
    }
  }
};

//http://192.168.10.85:9090/#/chart/preview/ac37153b-ebc0-4fae-847a-f0c4b1e2026f
//http://192.168.10.85:9090/#/graphic/preview/cc47b6d6-d1c8-410b-b8d7-02ad25bf64ef
const handlePreview = (data: any) => {
  console.log("handlePreview", data);
  const currentLocale = localeStore.currentLocale;
  const IP = stepStore.getCurrentIP();

  let name = window.location.hostname;
  let port = window.location.port;

  if (prduction) {
    if (data.type === "Dashboard") {
      window.open(
        `http://${name}:${port}/editor/#/chart/preview/1/${IP}/${currentLocale}`,
        "_blank",
      );
    } else {
      window.open(
        `http://${name}:${port}/editor/#/graphic/preview/2/${IP}/${currentLocale}`,
        "_blank",
      );
    }
  } else {
    if (data.type === "Dashboard") {
      window.open(
        `http://${name}:5173/#/chart/preview/1/${IP}/${currentLocale}`,
        "_blank",
      );
    } else {
      window.open(
        `http://${name}:5173/#/graphic/preview/2/${IP}/${currentLocale}`,
        "_blank",
      );
    }
  }
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
      color: var(--header-text-color);
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
