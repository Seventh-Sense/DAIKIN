<template>
  <div class="block">
    <div class="block-top">
      <div>{{ data.type }}</div>
      <Icons
        name="display"
        type="mono-line"
        :size="24"
        :color="{ normal: '#222222FF' }"
        @click="handlePreview"
      />
    </div>
    <div class="block-actions">
      <div class="block-actions-title">
        <span class="block-name">{{ data.name }}</span>
        <span class="block-time">{{ formatTime(data.time) }}</span>
      </div>
      <div class="block-actions-btns">
        <Icons
          name="input"
          type="mono-line"
          :size="24"
          :color="{ normal: '#222222FF' }"
          @click="handleRename"
        />
        <Icons
          name="edit"
          type="mono-line"
          :size="24"
          :color="{ normal: '#222222FF' }"
          @click="handleEdit"
        />
        <Icons
          name="delete"
          type="mono-line"
          :size="24"
          :color="{ normal: '#F76F83FF' }"
          @click="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icons from "@/icons/index.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits<{
  rename: [data: any];
  edit: [data: any];
  delete: [data: any];
  preview: [data: any];
}>();

// 处理预览
const handlePreview = () => {
  emit("preview", props.data);
};

// 处理重命名
const handleRename = () => {
  emit("rename", props.data);
};

// 处理编辑
const handleEdit = () => {
  emit("edit", props.data);
};

// 处理删除
const handleDelete = () => {
  emit("delete", props.data);
};

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style lang="less" scoped>
.block {
  height: 193px;
  background-color: #22222212;
  border-radius: 6px;
  display: flex;
  flex-direction: column;

  &-top {
    height: 145px;
    background-color: #22222212;
    display: flex;
    justify-content: space-between;
    padding: 8px 8px 0 8px;
  }

  &-actions {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;

    &-title {
      display: flex;
      flex-direction: column;
    }

    &-btns {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-shrink: 0;
    }
  }

  &-name {
    font-weight: 400;
    font-size: 14px;
    color: #222222;
    line-height: 20px;
    text-align: left;
    font-style: normal;
  }

  &-time {
    font-weight: 400;
    font-size: 12px;
    color: #22222299;
    line-height: 17px;
    text-align: left;
    font-style: normal;
  }
}
</style>
