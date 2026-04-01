<template>
  <a-drawer
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('device_search.title')"
    :width="500"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('device_search.ok')"
    :get-container="getModalContainer"
    @ok="handleOk"
  >
    <div>asd</div>
  </a-drawer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelShow"]);

const getModalContainer = () => {
  return document.querySelector(".ant-drawer-content") || document.body;
};

const { t } = useI18n();

const handleOk = (e: MouseEvent) => {};

const handleModalOpenChange = (newOpenState: boolean) => {
  if (!newOpenState) {
  }

  emit("update:modelShow", newOpenState);
};
</script>

<style lang="scss" scoped></style>
