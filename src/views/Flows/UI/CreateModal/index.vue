<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('ui.add_dashboard')"
    :width="400"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-block">
        <span class="modal-block-property">{{ t("ui.name") }}</span>
        <a-input v-model:value="data.name" />
      </div>
      <div class="modal-block">
        <span class="modal-block-property">{{ t("ui.type") }}</span>
        <a-select v-model:value="data.type" :options="options" />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelShow", "add"]);

const options = [
  {
    label: "Dashboard",
    value: "dashboard",
  },
  {
    label: "Graphic",
    value: "graphic",
  },
];

const data = ref({
  name: "New Project",
  type: "dashboard",
});

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
    data.value = {
      name: "New Project",
      type: "dashboard",
    };
  }
};

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const handleOk = () => {
  if (!data.value.name.trim()) {
    message.error(t("ui.name_not_empty"));
    return;
  }

  const newItem = {
    id: generateUniqueId(),
    name: data.value.name.trim(),
    time: new Date().toISOString(), // 当前时间的ISO格式
    type: data.value.type,
  };

  emit("add", newItem);

  emit("update:modelShow", false);
};
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 100%;
  padding: 10px 6px 0 6px;

  &-block {
    display: flex;
    flex-direction: column;
    margin-bottom: 22px;

    &-property {
      font-weight: 400;
      font-size: 12px;
      color: var(--sider-text-color);
      line-height: 17px;
      text-align: left;
      font-style: normal;
    }
  }
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
