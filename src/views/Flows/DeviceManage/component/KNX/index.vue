<template>
  <div class="content">
    <div class="content-porperty">{{ $t("device_manage.local_ip") }}</div>
    <a-input
      v-model:value="data.property.local_ip"
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
    <div class="content-porperty">{{ $t("mqtt.pkey") }}</div>
    <a-input
      v-model:value="data.property.pkey"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.group") }}</div>
    <a-input-number
      v-model:value="data.property.group"
      :min="1"
      :max="10"
      :step="1"
      :precision="0"
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
