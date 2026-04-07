<template>
  <div class="content">
    <div class="content-porperty">{{ $t("device_manage.slave_id") }}</div>
    <a-input
      v-model:value="data.property.slaveid"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.host") }}</div>
    <a-input
      v-model:value="data.property.host"
      style="width: 100%; margin-bottom: 12px"
    />
    <div class="content-porperty">{{ $t("device_manage.port") }}</div>
    <a-input-number
      v-model:value="data.property.port"
      :min="0"
      style="width: 100%; margin-bottom: 12px"
    />
    <!-- <div class="content-porperty">{{ $t("device_manage.connection") }}</div>
    <a-input
      v-model:value="data.property.connectionOption"
      disabled
      style="width: 100%; margin-bottom: 12px"
    /> -->
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
