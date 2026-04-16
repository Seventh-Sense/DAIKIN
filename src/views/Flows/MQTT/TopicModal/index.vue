<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('mqtt.modal_title')"
    :width="600"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-block">
        <span class="modal-block-property">{{ t("mqtt.serial_number") }}</span>
        <a-select v-model:value="data.serial_number" :options="options" />
      </div>
      <div class="modal-block">
        <span class="modal-block-property">{{ t("mqtt.sub_topic") }}</span>
        <a-input v-model:value="data.sub_topic" />
      </div>
      <div class="modal-block">
        <span class="modal-block-property">{{ t("mqtt.pub_topic") }}</span>
        <a-input v-model:value="data.pub_topic" />
      </div>
      <div class="modal-block">
        <span class="modal-block-property">{{ t("mqtt.interval") }}</span>
        <a-input-number
          v-model:value="data.interval"
          :min="1"
          style="width: 100%"
        />
      </div>
      <div class="modal-block">
        <span class="modal-block-property">{{ t("mqtt.sn") }}</span>
        <a-input v-model:value="data.sn" disabled/>
      </div>
      <div class="modal-block">
        <span class="modal-block-property">{{ t("mqtt.pkey") }}</span>
        <a-input v-model:value="data.pkey" />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  List: {
    type: Array,
    default: () => [],
  },
  sns: {
    type: Array,
    default: () => [],
  },
});

const data = ref({
  serial_number: "",
  sub_topic: "",
  pub_topic: "",
  interval: 10,
  sn: "",
  pkey: "",
});

const baseOptions = ref(props.sns);

const options = computed(() => {
  // 取出已选的name
  const selectedNames = props.List?.map((item: any) => item.name) || [];
  // 返回未选中的
  return baseOptions.value.filter((opt: any) => !selectedNames.includes(opt.value));
});

const emit = defineEmits(["update:modelShow", "add"]);

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
    resetForm();
  }
};

watch(
  () => data.value.serial_number,
  (newVal) => {
    data.value.sn = newVal || "";
  }
);

const handleOk = () => {
  if (
    !data.value.serial_number.trim() ||
    !data.value.sub_topic.trim() ||
    !data.value.pub_topic.trim() ||
    !data.value.sn.trim() ||
    !data.value.pkey.trim()
  ) {
    message.warn(t("mqtt.no_empty"));
    return;
  }

  if (!data.value.interval || Number(data.value.interval) < 1) {
    message.warn(t("mqtt.interval_invalid"));
    return;
  }

  const newTopic = {
    name: data.value.serial_number,
    sub_topic: data.value.sub_topic.trim(),
    pub_topic: data.value.pub_topic.trim(),
    interval: data.value.interval,
    sn: data.value.sn.trim(),
    pkey: data.value.pkey.trim(),
  };

  emit("add", newTopic);

  emit("update:modelShow", false);

  resetForm();
};

const resetForm = () => {
  data.value = {
    serial_number: "",
    sub_topic: "",
    pub_topic: "",
    interval: 10,
    sn: "",
    pkey: "",
  };
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
  border-bottom: 1px solid var(--header-text-color) !important;

  &:focus,
  &:hover,
  &.ant-input-number-focused {
    box-shadow: none !important;
    outline: none !important;
  }

  .ant-input-number-input {
    padding-left: 0;
  }
}
</style>
