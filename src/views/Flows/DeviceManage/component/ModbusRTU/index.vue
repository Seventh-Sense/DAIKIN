<template>
  <div class="content">
    <div class="content-porperty">{{ $t("device_manage.group") }}</div>
    <a-input-number
      v-model:value="data.property.group"
      :min="1"
      :max="10"
      :step="1"
      :precision="0"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.device_sn") }}</div>
    <a-input
      v-model:value="data.property.sn"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("mqtt.pkey") }}</div>
    <a-input
      v-model:value="data.property.pkey"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.desc") }}</div>
    <a-input
      v-model:value="data.property.desc"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.slave_id") }}</div>
    <a-input
      v-model:value="data.property.slaveid"
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
import { ref, onMounted } from "vue";
import {
  parityOptions,
  databitOptions,
  stopbitOptions,
  baudOptions,
} from "../../utils/options";

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
    value: 234881029,
  },
  {
    label: "Modbus2",
    value: 234881030,
  },
  {
    label: "Modbus2",
    value: 234881031,
  },
]);

// onMounted(() => {
//   fetchSerialOptions();
// });

// const fetchSerialOptions = async () => {
//   try {
//   } catch (error) {
//     console.error("Failed to fetch serial options:", error);
//   }
// };
</script>

<style lang="less" scoped>
.content {
  &-porperty {
    margin-bottom: 4px;
  }
}
</style>
