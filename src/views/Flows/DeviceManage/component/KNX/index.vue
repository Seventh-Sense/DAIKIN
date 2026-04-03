<template>
  <div class="content">
    <div class="content-porperty">{{ $t("device_manage.address_format") }}</div>
    <a-select
      v-model:value="data.property.address_format"
      :options="addrFormatOptions"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">
      {{ $t("device_manage.connection_type") }}
    </div>
    <a-select
      v-model:value="data.property.connection_type"
      :options="connectTypeOptions"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.gateway_ip") }}</div>
    <a-input
      v-model:value="data.property.gateway_ip"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.gateway_port") }}</div>
    <a-input-number
      v-model:value="data.property.gateway_port"
      :min="0"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.device_sn") }}</div>
    <a-input
      v-model:value="data.property.sn"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.device_dev") }}</div>
    <a-input
      v-model:value="data.property.dev"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.desc") }}</div>
    <a-input
      v-model:value="data.property.desc"
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
