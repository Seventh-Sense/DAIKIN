<template>
  <div class="content">
    <div class="content-porperty">{{ $t("device_manage.slave_id") }}</div>
    <a-input-number
      v-if="!isEdit"
      v-model:value="data.property.slaveid"
      :min="1"
      :max="254"
      style="width: 100%; margin-bottom: 12px"
    />
    <a-input
      v-else
      v-model:value="data.property.slaveid"
      disabled
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.connection") }}</div>
    <a-select
      v-model:value="data.property.connectionOption"
      :options="connectionOptions"
      disabled
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">
      {{ $t("device_manage.serial_settings") }}
    </div>
    <a-select
      v-model:value="data.property.port"
      :options="serialOptions"
      :disabled="isEdit"
      style="width: 100%; margin-bottom: 12px"
    />
    <a-row :gutter="32">
      <a-col :span="12">
        <div class="content-porperty">{{ $t("device_manage.baud") }}</div>
        <a-select
          v-model:value="data.property.baudrate"
          :options="baudOptions"
          :disabled="isEdit"
          style="width: 100%; margin-bottom: 12px"
        />
        <div class="content-porperty">{{ $t("device_manage.stop_bits") }}</div>
        <a-select
          v-model:value="data.property.stopbits"
          :options="stopbitOptions"
          :disabled="isEdit"
          style="width: 100%; margin-bottom: 12px"
        />
      </a-col>
      <a-col :span="12">
        <div class="content-porperty">{{ $t("device_manage.data_bits") }}</div>
        <a-select
          v-model:value="data.property.bytesize"
          :options="databitOptions"
          :disabled="isEdit"
          style="width: 100%; margin-bottom: 12px"
        />
        <div class="content-porperty">{{ $t("device_manage.parity") }}</div>
        <a-select
          v-model:value="data.property.parity"
          :options="parityOptions"
          :disabled="isEdit"
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
  connectionOptions,
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
    label: "COM1",
    value: "COM1",
  },
]);

onMounted(() => {
  fetchSerialOptions();
});

const fetchSerialOptions = async () => {
  try {
  } catch (error) {
    console.error("Failed to fetch serial options:", error);
  }
};
</script>

<style lang="less" scoped>
.content {
  &-porperty {
    margin-bottom: 4px;
  }
}
</style>
