<template>
  <div class="content">
    <div class="content-porperty">{{ $t("device_manage.slave_id") }}</div>
    <a-input-number
      v-if="!isEdit"
      v-model:value="data.address"
      :min="1"
      :max="254"
      style="width: 100%; margin-bottom: 12px"
    />
    <a-input
      v-else
      v-model:value="data.address"
      disabled
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.host") }}</div>
    <a-input
      v-model:value="data.property.host"
      :disabled="isEdit"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.port") }}</div>
    <a-input-number
      v-if="!isEdit"
      v-model:value="data.property.port"
      :min="0"
      style="width: 100%; margin-bottom: 12px"
    />
    <a-input
      v-else
      v-model:value="data.property.port"
      disabled
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.connection") }}</div>
    <a-input
      v-model:value="data.property.connectionOption"
      disabled
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
