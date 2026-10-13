<template>
  <div class="content">
    <div class="content-porperty">{{ $t("device_manage.desc") }}</div>
    <a-input
      v-model:value="data.property.desc"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.slave_id") }}</div>
    <a-input-number
      v-model:value="data.property.slaveid"
      :min="1"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.serialport") }}</div>
    <a-select
      v-model:value="data.property.serial_port"
      :options="serialOptions"
      style="width: 100%; margin-bottom: 12px"
    />
    <a-row :gutter="32">
      <a-col :span="12">
        <div class="content-porperty">{{ $t("device_manage.baud") }}</div>
        <a-select
          v-model:value="data.property.baudrate"
          :options="baudOptions"
          style="width: 100%; margin-bottom: 12px"
        />
        <div class="content-porperty">{{ $t("device_manage.stop_bits") }}</div>
        <a-select
          v-model:value="data.property.stop_bit"
          :options="stopbitOptions"
          style="width: 100%; margin-bottom: 12px"
        />
      </a-col>
      <a-col :span="12">
        <div class="content-porperty">{{ $t("device_manage.data_bits") }}</div>
        <a-select
          v-model:value="data.property.data_bit"
          :options="databitOptions"
          style="width: 100%; margin-bottom: 12px"
        />
        <div class="content-porperty">{{ $t("device_manage.parity") }}</div>
        <a-select
          v-model:value="data.property.parity"
          :options="parityOptions"
          style="width: 100%; margin-bottom: 12px"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
  parityOptions,
  databitOptions,
  stopbitOptions,
  baudOptions,
} from "../../utils/options";
import { useStepStore } from "@/pinia/modules/step";
import { useModbusConfigStore } from "@/pinia/modules/modbusConfig";

const stepStore = useStepStore();
const modbusConfigStore = useModbusConfigStore();

// 当前控制器 IP
const currentControllerIP = stepStore.getCurrentIP();

const props = defineProps({
  data: {
    type: Object as () => any,
    required: true,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const serialOptions = ref([
  {
    label: "Modbus1",
    value: "Modbus1",
  },
  {
    label: "Modbus2",
    value: "Modbus2",
  },
  {
    label: "Modbus3",
    value: "Modbus3",
  },
  {
    label: "Modbus4",
    value: "Modbus4",
  },
]);

// 从 store 加载指定串口的参数到表单
const applyParamsFromStore = (portName: string) => {
  const params = modbusConfigStore.getPortParams(currentControllerIP, portName);
  const p = props.data.property;
  p.baudrate = params.baudrate;
  p.data_bit = params.data_bit;
  p.parity = params.parity;
  p.stop_bit = params.stop_bit;
};

onMounted(() => {
  // 新建设备（isEdit=false）：当前 serial_port（默认 Modbus1）从 store 加载
  // store 有值则加载；store 没值则 getPortParams 返回 DEFAULT_PARAMS
  // 编辑设备（isEdit=true）：不覆盖，保留 controllerMap 里的设备原始值
  if (!props.isEdit) {
    const portName = props.data.property.serial_port;
    if (portName) {
      applyParamsFromStore(portName);
    }
  }
});

// 切换串口时（新建和编辑都触发），从 store 加载该串口的参数
watch(
  () => props.data.property.serial_port,
  (newPort, oldPort) => {
    if (!newPort) return;
    // 排除首次触发（组件初始化时 onMounted 已处理过）
    if (oldPort === undefined) return;
    if (newPort === oldPort) return;
    applyParamsFromStore(newPort);
  }
);
</script>

<style lang="less" scoped>
.content {
  &-porperty {
    margin-bottom: 4px;
  }
}
</style>
