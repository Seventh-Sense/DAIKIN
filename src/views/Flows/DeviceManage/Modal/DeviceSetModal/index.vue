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
            :disabled="isEdit"
            style="width: 100%"
          />
        </a-col>
        <a-col :span="6">
          <div class="modal-porperty">{{ $t("device_manage.polling") }}</div>
          <a-input-number
            v-model:value="data.polling"
            :min="0"
            style="width: 100%"
          />
        </a-col>
      </a-row>
      <div v-if="data.type !== DeviceTypeEnum.BACnet">
        <div class="modal-porperty" style="margin-top: 12px;">{{ $t("device_manage.enabled") }}</div>
        <a-select
          v-model:value="data.enabled"
          :options="BooleanOption"
          style="width: 100%;"
        />
      </div>

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
import { onMounted, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { BooleanOption, DataType, DeviceTypeEnum, pollOptions } from "../../utils/options";
import { useStepStore } from "@/pinia/modules/step";
import {
  getControllerType,
  getOptions,
  deviceDataCheck,
  createModbusTCPParams,
  createKNXParams,
  ModbusTCPData,
  ModbusRTUData,
  KNXData,
} from "../../utils/utils";
import BACnet from "../../component/BACnet/index.vue";
import ModbusTCP from "../../component/ModbusTCP/index.vue";
import ModbusRTU from "../../component/ModbusRTU/index.vue";
import KNX from "../../component/KNX/index.vue";
import { cloneDeep } from "lodash";
import { useControllerStore } from "@/pinia/modules/controller";

const controllerStore = useControllerStore();

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

const emit = defineEmits(["update:modelShow", "onSaveSuccess"]);

const data = ref<DataType>({
  id: "",
  name: "",
  type: DeviceTypeEnum.ModbusTCP,
  polling: 3,
  enabled: 1,
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

  if (!newOpenState && data.value.type === DeviceTypeEnum.BACnet) {
    emit("onSaveSuccess");
  }

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
    enabled: 1,
    property: {},
  };
};

const handleOk = () => {
  if (data.value.type === DeviceTypeEnum.BACnet) {
    emit("onSaveSuccess");
    emit("update:modelShow", false);
  } else {
    if (!deviceDataCheck(data.value)) {
      handleSubmitByType(data.value);
    }
  }
};

const handleSubmitByType = async (data: DataType) => {
  //console.log("Submitting data:", data);
  let params;

  switch (data.type) {
    case DeviceTypeEnum.ModbusTCP:
      params = createModbusTCPParams(data);
      break;
    case DeviceTypeEnum.KNX:
      params = createKNXParams(data);
      break;
    default:
      console.log("Submitting params:", data);
      return;
  }

  controllerStore.addDeviceToController(stepStore.getCurrentIP(), params);

  if (props.isEdit) {
    message.success(t("msg.msg_modify_success"));
  } else {
    message.success(t("msg.download_success"));
  }

  //刷新表格
  emit("onSaveSuccess");

  onClose();
};

const onClose = () => {
  resetForm();
  emit("update:modelShow", false);
};

const componentConfigMap = {
  [DeviceTypeEnum.BACnet]: {
    component: BACnet,
    defaultProperty: () => ({}),
  },
  [DeviceTypeEnum.ModbusTCP]: {
    component: ModbusTCP,
    defaultProperty: () => cloneDeep(ModbusTCPData),
  },
  [DeviceTypeEnum.ModbusRTU]: {
    component: ModbusRTU,
    defaultProperty: () => cloneDeep(ModbusRTUData),
  },
  [DeviceTypeEnum.KNX]: {
    component: KNX,
    defaultProperty: () => cloneDeep(KNXData),
  },
};

/**
 * 根据设备类型加载对应的动态组件并初始化属性
 * @param type 设备类型枚举值
 * @param isEdit 是否为编辑模式
 */
const insertContent = (type: DeviceTypeEnum, isEdit: boolean) => {
  // 1. 获取当前设备类型对应的配置
  const currentConfig = componentConfigMap[type];

  // 2. 设置动态组件（无配置则设为null）
  content.value = currentConfig?.component || null;

  // 3. 非编辑模式下初始化默认属性（编辑模式保留原有数据）
  if (!isEdit && currentConfig) {
    data.value.property = currentConfig.defaultProperty();
  }
};

// 初始化编辑数据
const initEditData = () => {
  if (props.isEdit && props.initData) {
    //console.log("initEditData", props.initData);
    data.value = {
      id: props.initData.uid,
      name: props.initData.device_name,
      type: props.initData.device_type,
      polling: props.initData.polling,
      enabled: props.initData.enabled ? 1: 0,
      property: {
        ...cloneDeep(props.initData.property),
        sn: props.initData.device_sn || "",
        dev: props.initData.device_dev || "",
        desc: props.initData.description || "",
      },
    };

    // 加载对应类型的组件
    insertContent(data.value.type as DeviceTypeEnum, true);
  }
};

watch(
  () => props.modelShow,
  (newVal) => {
    if (newVal) {
      // 弹窗打开时才初始化数据
      if (props.isEdit) {
        initEditData();
      } else {
        resetForm();
        insertContent(data.value.type as DeviceTypeEnum, false);
      }
    } else {
      // 弹窗关闭时重置
      resetForm();
    }
  },
  { immediate: true }, // 立即执行一次，处理初始状态
);

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
