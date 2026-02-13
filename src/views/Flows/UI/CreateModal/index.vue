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
  </a-modal>
</template>

<script setup lang="ts">
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

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);
};

const handleOk = () => {

}
</script>

<style lang="less" scoped>
</style>
