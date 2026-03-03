<template>
  <div class="card">
    <div class="card-top">{{ t("mqtt.title") }}</div>
    <div class="card-content">
      <div class="card-content-top">
        <div class="card-content-block">
          <span class="card-content-text">{{ t("mqtt.host") }}</span>
          <a-input v-model:value="info.host" style="width: 309px" readonly />
        </div>
        <div class="card-content-block">
          <span class="card-content-text">{{ t("mqtt.port") }}</span>
          <a-input v-model:value="info.port" style="width: 309px" readonly />
        </div>
      </div>
      <div class="card-content-row">
        <span class="card-content-row-title">{{ t("mqtt.topics") }}</span>
        <a-button type="primary" class="card-btn-add" @click="onAdd">
          {{ t("mqtt.add") }}
          <Icons
            name="addCircle"
            type="mono-line"
            :size="20"
            :color="{ normal: '#ffffff' }"
          />
        </a-button>
      </div>
      <div class="card-content-list">
        <TopicCard
          v-for="(item, index) in list"
          :key="index"
          :data="item"
          @update="handleUpdate(index, $event)"
          @delete="handleDelete(index)"
        />
      </div>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
    <TopicModal
      v-if="showModal"
      v-model:modelShow="showModal"
      @add="handleAdd"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { handleEditCompleteJump } from "../until/util";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";
import TopicCard from "./TopicCard/index.vue";
import TopicModal from "./TopicModal/index.vue";

const { t } = useI18n();

const showModal = ref(false);

const info = reactive({
  host: "47.103.19.245",
  port: "1888",
});

const list = reactive([
  {
    name: "ABCD-1234",
    sub_topic: "/cloud/YANHUA/AC/cmd/set",
    pub_topic: "/cloud/YANHUA/AC/cmd/set",
    interval: 10,
  },
  {
    name: "ABCD-12",
    sub_topic: "/cloud/YANHUA/AC/cmd/set",
    pub_topic: "/cloud/YANHUA/AC/cmd/set",
    interval: 10,
  },
  {
    name: "ABCD-34",
    sub_topic: "/cloud/YANHUA/AC/cmd/set",
    pub_topic: "/cloud/YANHUA/AC/cmd/set",
    interval: 10,
  },
  {
    name: "ABCD-1234",
    sub_topic: "/cloud/YANHUA/AC/cmd/set",
    pub_topic: "/cloud/YANHUA/AC/cmd/set",
    interval: 10,
  },
  {
    name: "ABCD-12",
    sub_topic: "/cloud/YANHUA/AC/cmd/set",
    pub_topic: "/cloud/YANHUA/AC/cmd/set",
    interval: 10,
  },
  {
    name: "ABCD-34",
    sub_topic: "/cloud/YANHUA/AC/cmd/set",
    pub_topic: "/cloud/YANHUA/AC/cmd/set",
    interval: 10,
  },
]);

const onClick = () => {
  handleEditCompleteJump();
};

const handleUpdate = (index: number, newData: any) => {
  // 替换对应索引的项，触发响应式更新
  list[index] = { ...newData };
};

// 处理卡片删除
const handleDelete = (index: number) => {
  list.splice(index, 1);
};

const onAdd = () => {
  showModal.value = true;
};

const handleAdd = (newTopic: any) => {
  list.push(newTopic);
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

    &-top {
      height: 56px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-shrink: 0;
    }

    &-block {
      display: flex;
      flex-direction: column;
    }

    &-text {
      font-weight: 400;
      font-size: 12px;
      color: var(--sider-text-color);
      line-height: 17px;
      text-align: left;
      font-style: normal;
    }

    &-row {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      margin-bottom: 8px;

      &-title {
        font-weight: 400;
        font-size: 14px;
        color: var(--sider-text-color);
        line-height: 20px;
        text-align: left;
        font-style: normal;
      }
    }

    &-list {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 8px 0;
      align-content: flex-start;
    }
  }

  &-btn {
    width: 74px;
    height: 32px;
    padding: 0;
    border-radius: 0;
  }

  &-btn-add {
    width: 74px;
    height: 32px;
    padding: 0;
    border-radius: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
  }
}

@media (max-width: 768px) {
  .card-content-list {
    grid-template-columns: 1fr !important;
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
</style>
