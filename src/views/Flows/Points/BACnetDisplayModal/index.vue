<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('device_manage.edit_point')"
    :width="800"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-porperty">{{ $t("device_manage.point_name") }}</div>
      <a-input
        v-model:value="props.editData.point_name"
        style="margin-bottom: 12px"
        disabled
      />
      <div class="modal-porperty">{{ $t("device_manage.type") }}</div>
      <a-input
        v-model:value="props.editData.property.object_type"
        style="margin-bottom: 12px"
        disabled
      />
      <div class="modal-porperty">{{ $t("device_manage.point_id") }}</div>
      <a-input
        v-model:value="props.editData.property.object_instance"
        style="margin-bottom: 12px"
        disabled
      />
      <div class="modal-porperty">{{ $t("device_manage.point_m") }}</div>
      <a-input v-model:value="data.point_m" style="margin-bottom: 12px" />
      <div class="modal-porperty">Pkey</div>
      <a-input v-model:value="data.description" style="margin-bottom: 12px" />
      <div class="modal-porperty">{{ $t("device_manage.min") }}</div>
      <a-input-number v-model:value="data.min" style="width: 100%;margin-bottom: 12px" />
      <div class="modal-porperty">{{ $t("device_manage.max") }}</div>
      <a-input-number v-model:value="data.max" style="width: 100%;margin-bottom: 12px" />
      <div class="modal-porperty">{{ $t("device_manage.writable") }}</div>
      <a-select
        v-model:value="data.writable"
        :options="BooleanOption"
        style="width: 100%; margin-bottom: 12px"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useStepStore } from "@/pinia/modules/step";
import { useControllerStore } from "@/pinia/modules/controller";
import { onMounted, ref, watch } from "vue";
import { BooleanOption } from "../../DeviceManage/utils/options";
import { message } from "ant-design-vue";

const stepStore = useStepStore();
const controllerStore = useControllerStore();
const emit = defineEmits(["update:modelShow", "onSaveSuccess"]);

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();

const data = ref<any>({
  description: "",
  point_m: "",
  writable: 1,
  min: undefined,
  max: undefined,
});

onMounted(() => {
  //console.log(props.editData);
});

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
};

const handleOk = () => {
  const submitData = {
    ...props.editData,
    description: data.value.description,
    point_m: data.value.point_m,
    writable: !!data.value.writable,
    property: {
      ...props.editData.property,
      min: data.value.min,
      max: data.value.max,
    },
  };

  controllerStore.addPointToControllerDevice(
    stepStore.getCurrentIP(),
    stepStore.getCurrentDeviceInfo().uid,
    submitData,
  );

  message.success(t("msg.msg_modify_success"));
  emit("onSaveSuccess");
  emit("update:modelShow", false);
};

const initFormData = () => {
  if (!props.editData) return;
  data.value = {
    description: props.editData.description || "",
    point_m: props.editData.point_m || "",
    writable: props.editData.writable ? 1 : 0,
    min:
      props.editData.property.min === null
        ? undefined
        : props.editData.property.min,
    max:
      props.editData.property.max === null
        ? undefined
        : props.editData.property.max,
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
  height: 100%;
  padding: 10px 6px 0 6px;

  &-porperty {
    margin-bottom: 4px;
  }
}
</style>
