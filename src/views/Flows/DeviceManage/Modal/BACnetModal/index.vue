<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('device_manage.device_info')"
    :width="800"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-porperty">{{ $t("device_manage.name") }}</div>
      <a-input
        v-model:value="initData.device_name"
        style="margin-bottom: 12px"
        disabled
      />
      <div class="modal-porperty">{{ $t("device_manage.device_type") }}</div>
      <a-input
        v-model:value="initData.protocol"
        style="margin-bottom: 12px"
        disabled
      />
      <div class="modal-porperty">{{ $t("device_manage.device_sn") }}</div>
      <a-input v-model:value="data.sn" style="margin-bottom: 12px" />
      <div class="modal-porperty">{{ $t("mqtt.pkey") }}</div>
      <a-input v-model:value="data.pkey" style="margin-bottom: 12px" />
      <div class="content-porperty">{{ $t("device_manage.group") }}</div>
      <a-input-number
        v-model:value="data.group"
        :min="1"
        :max="10"
        :step="1"
        :precision="0"
        style="width: 100%; margin-bottom: 12px"
      />
      <div class="modal-porperty">{{ $t("device_manage.address") }}</div>
      <a-input v-model:value="initData.address" style="margin-bottom: 12px" />
      <div class="modal-porperty">{{ $t("device_manage.enabled") }}</div>
      <a-select
        v-model:value="data.enabled"
        :options="BooleanOption"
        style="width: 100%; margin-bottom: 12px"
      />

      <div class="modal-porperty">{{ $t("device_manage.polling") }}</div>
      <a-input-number
        v-model:value="data.polling"
        :min="0"
        style="width: 100%; margin-bottom: 12px"
      />
      <div class="modal-porperty">{{ $t("device_manage.desc") }}</div>
      <a-input v-model:value="data.description" style="margin-bottom: 12px" />
      <div class="modal-porperty">{{ $t("device_manage.model_name") }}</div>
      <a-input
        v-model:value="initData.property.model_name"
        style="margin-bottom: 12px"
      />
      <!-- <div class="modal-porperty">{{ $t("device_manage.vendor_name") }}</div>
      <a-input
        v-model:value="initData.property.vendor_name"
        style="margin-bottom: 12px"
        disabled
      />
      <div class="modal-porperty">
        {{ $t("device_manage.vendor_identifier") }}
      </div>
      <a-input
        v-model:value="initData.property.vendor_id"
        style="margin-bottom: 12px"
        disabled
      />
      <div class="modal-porperty">
        {{ $t("device_manage.max_apdu_length_accepted") }}
      </div>
      <a-input
        v-model:value="initData.property.max_apdu_length"
        style="margin-bottom: 12px"
        disabled
      />
      <div class="modal-porperty">
        {{ $t("device_manage.segmentation_supported") }}
      </div>
      <a-input
        v-model:value="initData.property.segmentation_supported"
        style="margin-bottom: 12px"
        disabled
      /> -->
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { BooleanOption } from "../../utils/options";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";
import { message } from "ant-design-vue";

const stepStore = useStepStore();
const controllerStore = useControllerStore();
const { t } = useI18n();

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  initData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelShow", "onSaveSuccess"]);

const data = ref<any>({
  description: "",
  pkey: "",
  group: "",
  sn: "",
  enabled: 1,
  polling: 3,
});

onMounted(() => {
  //console.log(props.initData);
});

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
};

const handleOk = () => {
  const submitData = {
    ...props.initData,
    ...data.value,
    enabled: !!data.value.enabled,
  };

  controllerStore.addDeviceToController(stepStore.getCurrentIP(), submitData);

  message.success(t("msg.msg_modify_success"));
  emit("onSaveSuccess");
  emit("update:modelShow", false);
};

const initFormData = () => {
  if (!props.initData) return;
  data.value = {
    description: props.initData.description || "",
    pkey: props.initData.pkey || "",
    sn: props.initData.sn || "",
    group: props.initData.group || "",
    enabled: props.initData.enabled ? 1 : 0,
    polling: props.initData.polling || 3,
  };
};

watch(
  () => props.modelShow,
  (val) => {
    if (val) {
      initFormData();
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 600px;
  padding: 10px 6px 0 6px;
  overflow-y: auto;

  &-porperty {
    margin-bottom: 4px;
  }
}
</style>
