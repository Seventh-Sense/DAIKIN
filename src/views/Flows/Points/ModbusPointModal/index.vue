<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="
      props.isEdit
        ? t('device_manage.device_info')
        : t('device_manage.add_device')
    "
    :width="800"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
  <div>
    asdas
  </div>
  </a-modal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const emit = defineEmits(["update:modelShow"]);

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    required: true,
  },
  initData: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();

const handleOk = () => {};

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
};
</script>

<style lang="less" scoped></style>
