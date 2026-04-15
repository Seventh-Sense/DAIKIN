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
        <div class="modal-property">{{ MODBUS_ID_MAP(String(key)) }}</div>
        <div
          v-if="
            key === 'name' ||
            key === 'description' ||
            key === 'address' ||
            key === 'm' ||
            key === 'unit'
          "
        >
          <a-input
            v-model:value="data[key]"
            :placeholder="
              key === 'address'
                ? t('device_manage.modbus_tip_enter')
                : key === 'name'
                  ? t('device_manage.please_enter_name')
                  : ''
            "
            :disabled="key === 'address' && props.isEdit"
          />
        </div>
        <div
          v-else-if="
            key === 'function' ||
            key === 'data_type' ||
            key === 'writable' ||
            key === 'align_format'
          "
        >
          <a-select
            v-model:value="data[key]"
            :options="modbusSelectOptions(key)"
            style="width: 100%"
          />
        </div>
        <div v-else-if="key === 'count' || key === 'scale' || key === 'offset'">
          <a-input-number
            v-model:value="data[key]"
            :min="0"
            style="width: 100%"
          />
        </div>
        <div v-else-if="key === 'min' || key === 'max'">
          <a-input-number v-model:value="data[key]" style="width: 100%" />
        </div>
        <div v-else></div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { modbusSelectOptions, validateIntegerOrRange } from "../tool";
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

const currentIP = stepStore.getCurrentIP();

const { t } = useI18n();

const defaultData = {
  uid: "",
  name: "",
  m: "",
  description: "",
  function: 4,
  address: "",
  count: 1,
  data_type: "int16",
  align_format: "",
  scale: 1,
  offset: 0,
  min: null,
  max: null,
  unit: "",
  writable: 1,
};

const data = ref({ ...defaultData });

const MODBUS_ID_MAP = (key: string) => {
  const ID_MAP: { [key: string]: string } = {
    name: t("device_manage.name"),
    m: t("device_manage.point_m"),
    description: t("device_manage.desc"),
    function: t("device_manage.reg_type"),
    address: t("device_manage.reg_attr"),
    count: t("device_manage.reg_num"),
    data_type: t("device_manage.data_type"),
    byteorder: t("device_manage.byte_order"),
    wordorder: t("device_manage.word_order"),
    scale: t("device_manage.coefficient"),
    offset: t("device_manage.offset"),
    align_format: t("device_manage.align_format"),
    unit: t("device_manage.unit"),
    min: t("device_manage.min"),
    max: t("device_manage.max"),
    writable: t("device_manage.writable"),
  };

  return ID_MAP[key] ? ID_MAP[key] : "";
};

const dataCheck = (data: any) => {
  // 名称为空校验
  if (data.name === "") {
    message.warn(t("msg.msg_name_cannot_empty"));
    return true;
  }

  // 寄存器数量为空校验
  if (data.count === null || data.count === "") {
    message.warn(t("msg.msg_reg_count_cannot_empty"));
    return true;
  }

  // 除数为空校验
  if (data.scale === null || data.scale === "") {
    message.warn(t("msg.msg_divisor_cannot_empty"));
    return true;
  }

  // 地址为空校验
  if (data.address === "") {
    message.warn(t("msg.msg_address_cannot_empty"));
    return true;
  }

  // 地址格式校验
  if (!validateIntegerOrRange(data.address)) {
    message.warn(t("msg.msg_invalid_address_format"));
    return true;
  }

  return false;
};

const addNewPoint = async () => {
  const params = {
    uid: data.value.uid || generateTimeUniqueId(),
    point_name: data.value.name,
    point_m: data.value.m,
    description: data.value.description,
    writable: data.value.writable === 1,
    property: {
      function: data.value.function,
      address: Number(data.value.address),
      count: data.value.count,
      data_type: data.value.data_type,
      align_format: data.value.align_format,
      scale: data.value.scale,
      offset: data.value.offset,
      unit: data.value.unit,
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

const addNewPoints = async () => {
  try {
    const [startStr, endStr] = data.value.address.split("-");

    const startAddress = parseInt(startStr, 10);
    const endAddress = parseInt(endStr, 10);

    // 批量创建点位数据
    const pointCount = endAddress - startAddress + 1;

    for (let i = 0; i < pointCount; i++) {
      const currentAddress = startAddress + i;

      const params = {
        uid: generateTimeUniqueId(),
        point_name: `${data.value.name} ${currentAddress}`,
        point_m: data.value.m,
        description: data.value.description,
        writable: data.value.writable === 1,
        property: {
          function: data.value.function,
          address: currentAddress,
          count: data.value.count,
          data_type: data.value.data_type,
          align_format: data.value.align_format,
          scale: data.value.scale,
          offset: data.value.offset,
          unit: data.value.unit,
          min: data.value.min === null ? undefined : data.value.min,
          max: data.value.max === null ? undefined : data.value.max,
        },
      };

      controllerStore.addPointToControllerDevice(
        currentIP,
        deviceInfo.value.id,
        params,
      );
    }

    message.success(t("msg.msg_add_point_success"));
    emit("onSaveSuccess");
  } catch (e) {
    console.error("批量添加失败:", e);
    message.warn(t("msg.msg_add_point_failed"));
  } finally {
    emit("update:modelShow", false);
  }
};

const handleOk = () => {
  if (!dataCheck(data.value)) {
    if (data.value.address.includes("-")) {
      addNewPoints();
    } else {
      addNewPoint();
    }
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
        function: props.editData.property.function,
        address: props.editData.property.address.toString(),
        count: props.editData.property.count,
        data_type: props.editData.property.data_type,
        scale: props.editData.property.scale,
        offset: props.editData.property.offset,
        align_format: props.editData.property.align_format,
        unit: props.editData.property.unit,
        min: props.editData.property.min,
        max: props.editData.property.max,
        writable: props.editData.writable ? 1 : 0,
      };

      //console.log('asda', props.editData)
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
  overflow: auto;

  &-property {
    margin-bottom: 4px;
  }
}
</style>
