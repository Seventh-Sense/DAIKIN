<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="
      props.isEdit
        ? t('device_manage.edit_point')
        : t('device_manage.add_point')
    "
    :width="800"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
    <div class="modal">
      <div
        v-for="(val, key, index) in data"
        :key="key"
        style="margin-top: 12px"
      >
        <div class="modal-porperty">{{ KNX_ID_MAP(String(key)) }}</div>
        <div
          v-if="
            key === 'name' ||
            key === 'description' ||
            key === 'read_address' ||
            key === 'write_address' ||
            key === 'tags' ||
            key === 'm'
          "
        >
          <a-input v-model:value="data[key]" />
        </div>
        <div v-else-if="key === 'value_type'">
          <a-select
            v-model:value="data[key]"
            :options="KNXValueTypeOptions"
            style="width: 100%"
          />
        </div>
        <div v-else-if="key === 'writable'">
          <a-select
            v-model:value="data[key]"
            :options="BooleanOption"
            style="width: 100%"
          />
        </div>
        <div v-else-if="key === 'min' || key === 'max'">
          <a-input-number v-model:value="data[key]" style="width: 100%" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  BooleanOption,
  KNXValueTypeOptions,
} from "../../DeviceManage/utils/options";
import { message } from "ant-design-vue";
import { useStepStore } from "@/pinia/modules/step";
import { useControllerStore } from "@/pinia/modules/controller";
import { generateTimeUniqueId } from "@/utils/function";

const stepStore = useStepStore();
const controllerStore = useControllerStore();

const emit = defineEmits(["update:modelShow", "onSaveSuccess"]);

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    required: true,
  },
  editData: {
    type: Object,
    required: true,
  },
});

const deviceInfo: any = inject("deviceInfo");

const { t } = useI18n();

const currentIP = stepStore.getCurrentIP();

const defaultData = {
  uid: "",
  name: "",
  m: "",
  description: "",
  read_address: "0/1/1",
  write_address: "0/0/1",
  value_type: "bool",
  tags: "",
  min: null,
  max: null,
  writable: 1,
};

const data = ref({ ...defaultData });

const KNX_ID_MAP = (key: string) => {
  const ID_MAP: { [key: string]: string } = {
    name: t("device_manage.name"),
    m: t("device_manage.point_m"),
    description: t("device_manage.desc"),
    read_address: t("device_manage.read_address"),
    write_address: t("device_manage.write_address"),
    value_type: t("device_manage.value_type"),
    tags: t("device_manage.tags"),
    value: t("device_manage.value"),
    min: t("device_manage.min"),
    max: t("device_manage.max"),
    writable: t("device_manage.writable"),
  };

  return ID_MAP[key] ? ID_MAP[key] : "";
};

const dataCheck = (data: any) => {
  let flag = false;

  //console.log(data)
  if (
    data.name === "" ||
    data.read_address === "" ||
    data.write_address === ""
  ) {
    message.warn(t("msg.msg_enter_required_params"));
    return true;
  }

  return flag;
};

const addNewPoint = async () => {
  const params = {
    uid: data.value.uid || generateTimeUniqueId(),
    point_name: data.value.name,
    point_m: data.value.m,
    description: data.value.description,
    writable: data.value.writable === 1,
    property: {
      read_address: data.value.read_address,
      write_address: data.value.write_address,
      value_type: data.value.value_type,
      tags: data.value.tags,
      min: data.value.min === null ? undefined : data.value.min,
      max: data.value.max === null ? undefined : data.value.max,
    },
  };

  controllerStore.addPointToControllerDevice(
    currentIP,
    deviceInfo.value.id,
    params,
  );

  if (props.isEdit) {
    message.success(t("msg.msg_modify_success"));
  } else {
    message.success(t("msg.msg_add_point_success"));
  }

  emit("onSaveSuccess");

  emit("update:modelShow", false);
};

const handleOk = () => {
  if (!dataCheck(data.value)) {
    addNewPoint();
  }
};

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
    data.value = { ...defaultData };
  }
};

watch(
  () => props.isEdit,
  (newVal) => {
    if (newVal) {
      data.value = {
        uid: props.editData.uid,
        name: props.editData.point_name,
        m: props.editData.point_m,
        description: props.editData.description,
        read_address: props.editData.property.read_address,
        write_address: props.editData.property.write_address,
        value_type: props.editData.property.value_type,
        tags: props.editData.property.tags,
        min: props.editData.property.min,
        max: props.editData.property.max,
        writable: props.editData.writable ? 1 : 0,
      };

      //console.log('asda', props.editData, value.value)
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

  &-property {
    margin-bottom: 4px;
  }
}
</style>
