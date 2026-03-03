<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('device_manage.add_device')"
    :width="800"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
    <div class="modal">
      <div v-if="data.type !== DeviceTypeEnum.BACnet">
        <div class="modal-porperty">{{ $t("device_manage.name") }}</div>
        <a-input v-model:value="data.name" style="margin-bottom: 12px" />
      </div>
      <a-row :gutter="32">
        <a-col :span="12">
          <div class="modal-porperty">{{ $t("device_manage.type") }}</div>
          <a-select
            v-model:value="data.type"
            :options="options"
            style="width: 100%"
          />
        </a-col>
        <a-col :span="6">
          <div class="modal-porperty">{{ $t("device_manage.polling") }}</div>
          <a-select
            v-model:value="data.polling"
            placeholder="Select"
            :options="pollOptions"
            style="width: 100%"
            disabled
          />
        </a-col>
      </a-row>
      <div
        v-if="content"
        class="dynamic-component-container"
        style="margin-top: 16px"
      >
        <component :is="content" :data="data" :is-edit="isEdit" />
      </div>
      <div v-else-if="data.type !== DeviceTypeEnum.BACnet" class="empty-tip">
        {{ t("device_manage.no_component_tip") }}
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
import { onMounted, ref, shallowRef, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import {
  DataType,
  DeviceTypeEnum,
  TypeOptions,
  pollOptions,
} from "../../utils/options";
import { useStepStore } from "@/pinia/modules/step";
import {
  getControllerType,
  getOptions,
  deviceDataCheck,
  createModbusTCPParams,
  createModbusRTUParams,
  createKNXParams,
} from "../../utils/utils";
import BACnet from "../../component/BACnet/index.vue";
import ModbusTCP from "../../component/ModbusTCP/index.vue";
import ModbusRTU from "../../component/ModbusRTU/index.vue";
import KNX from "../../component/KNX/index.vue";

const { t } = useI18n();
const stepStore = useStepStore();

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

const emit = defineEmits(["update:modelShow"]);

const data = ref<DataType>({
  id: "",
  name: "",
  type: DeviceTypeEnum.BACnet,
  polling: 3,
  enabled: true,
  address: 1,
  property: {},
});

// 动态组件引用
const content = shallowRef<null | { new (): any }>(null);

const controllerType = ref<any>(1);
const options = ref<any[]>([]);

onMounted(() => {
  controllerType.value = getControllerType(stepStore.currentStep);

  options.value = getOptions(controllerType.value);
});

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
    resetForm();
  }
};

// 重置表单
const resetForm = () => {
  content.value = null;
  data.value = {
    id: "",
    name: "",
    type: DeviceTypeEnum.BACnet,
    polling: 3,
    enabled: true,
    address: 1,
    property: {},
  };
};

const handleOk = () => {
  if (data.value.type === DeviceTypeEnum.BACnet) {
    emit("update:modelShow", false);
  } else {
    if (props.isEdit) {
      handleEditClose();
    } else {
      if (!deviceDataCheck(data.value)) {
        handleSubmitByType(data.value);
      }
    }
  }
};

const handleSubmitByType = async (deviceData: DataType) => {
  try {
    let params;

    switch (deviceData.type) {
      case DeviceTypeEnum.ModbusTCP:
        params = createModbusTCPParams(deviceData);
        break;
      case DeviceTypeEnum.ModbusRTU:
        params = createModbusRTUParams(deviceData);
        break;
      case DeviceTypeEnum.KNX:
        params = createKNXParams(deviceData);
        break;
      default:
        console.log("Submitting params:", deviceData);
        return;
    }

    // const res: any = await addDevice(params);

    // if (res.status !== "OK") {
    //   console.warn("Non-OK response status:", res.data);
    //   window["$message"].warning(res.status);
    //   return;
    // }

    onClose();
  } catch (error) {
    console.error(`Error handling ${deviceData.type}:`, error);
    //window["$message"].error(t("msg.msg_error_2"));
  }
};

const onClose = () => {
  resetForm();
  emit("update:modelShow", false);
};

const handleEditClose = () => {
  resetForm();
  emit("update:modelShow", false);
};

const insertContent = (type: DeviceTypeEnum, edit: boolean) => {
  switch (type) {
    case DeviceTypeEnum.BACnet:
      content.value = BACnet;
      data.value.property = {};
      break;
    case DeviceTypeEnum.ModbusTCP:
      content.value = ModbusTCP;

      break;
    case DeviceTypeEnum.ModbusRTU:
      content.value = ModbusRTU;

      break;
    case DeviceTypeEnum.KNX:
      content.value = KNX;

      break;
    default:
      content.value = null;
      data.value.property = {};
  }
};

// 监听弹窗显示状态，初始化组件
watchEffect(() => {
  if (props.modelShow && !props.isEdit) {
    // 新增模式打开弹窗时，默认加载BACnet组件
    insertContent(data.value.type as DeviceTypeEnum, false);
  }
});

// 监听设备类型变化
watch(
  () => data.value.type,
  (newValue) => {
    if (newValue) {
      insertContent(newValue as DeviceTypeEnum, props.isEdit);
    }
  },
  { immediate: true, deep: false },
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

.dynamic-component-container {
  margin-top: 16px;
}

.empty-tip {
  margin-top: 16px;
  padding: 20px;
  text-align: center;
  border-radius: 4px;
}
</style>
