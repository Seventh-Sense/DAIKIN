<template>
  <div class="content">
    <div class="content-porperty">{{ $t("device_manage.address_format") }}</div>
    <a-select
      v-model:value="data.property.address_format"
      :options="addrFormatOptions"
      :disabled="isEdit"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">
      {{ $t("device_manage.connection_type") }}
    </div>
    <a-select
      v-model:value="data.property.connection_type"
      :options="connectTypeOptions"
      :disabled="isEdit"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.gateway_ip") }}</div>
    <a-input
      v-model:value="data.property.gateway_ip"
      :disabled="isEdit"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.gateway_port") }}</div>
    <a-input-number
      v-if="!isEdit"
      v-model:value="data.property.gateway_port"
      :min="0"
      style="width: 100%; margin-bottom: 12px"
    />
    <a-input
      v-else
      v-model:value="data.property.gateway_port"
      disabled
      style="width: 100%; margin-bottom: 12px"
    />
  </div>
</template>

<script setup lang="ts">
import { connectTypeOptions, addrFormatOptions } from "../../utils/options";

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
</script>

<style lang="less" scoped>
.content {
  &-porperty {
    margin-bottom: 4px;
  }
}
</style>
