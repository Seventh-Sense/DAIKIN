<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('ui.rename')"
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
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  currentName: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelShow", "confirmRename"]);

const data = ref({
  name: "",
});

watch(
  () => props.currentName,
  (newName) => {
    data.value.name = newName;
  },
  { immediate: true },
);

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
    data.value.name = "";
  }
};

const handleOk = () => {
  if (!data.value.name) {
    window.alert(t("ui.name_not_empty"));
    return;
  }

  emit("confirmRename", {
    id: props.itemId,
    newName: data.value.name,
  });

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
