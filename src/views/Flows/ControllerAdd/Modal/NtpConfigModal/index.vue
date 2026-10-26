<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('ntp.title')"
    :width="480"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    :confirmLoading="loading"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-property">{{ t("ntp.ip") }}</div>
      <a-input
        v-model:value="form.ip"
        :placeholder="t('ntp.ip_placeholder')"
        style="margin-bottom: 12px"
      />

      <div class="modal-property">{{ t("ntp.port") }}</div>
      <a-input-number
        v-model:value="form.port"
        :min="1"
        :max="65535"
        :precision="0"
        :placeholder="t('ntp.port_placeholder')"
        style="width: 100%; margin-bottom: 12px"
      />

      <div class="modal-property">{{ t("ntp.interval") }}</div>
      <a-input-number
        v-model:value="form.interval"
        :min="1"
        :precision="0"
        style="width: 100%; margin-bottom: 12px"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { ref, watch } from "vue";
import { useControllerStore } from "@/pinia/modules/controller";
import { isValidIP } from "@/utils/function";

const { t } = useI18n();
const controllerStore = useControllerStore();

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  currentIp: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelShow"]);

const loading = ref(false);

const DEFAULT_FORM = { ip: "", port: 123, interval: 60 };

const form = ref<{ ip: string; port: number; interval: number }>({
  ...DEFAULT_FORM,
});

// 打开 Modal 时回填已有配置
watch(
  () => props.modelShow,
  (val) => {
    if (val) {
      const existing = controllerStore.getControllerNtp(props.currentIp);
      if (existing) {
        form.value = {
          ip: existing.ip ?? DEFAULT_FORM.ip,
          port: existing.port ?? DEFAULT_FORM.port,
          interval: existing.interval ?? DEFAULT_FORM.interval,
        };
      } else {
        form.value = { ...DEFAULT_FORM };
      }
    }
  },
  { immediate: true },
);

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);
};

const validateForm = () => {
  const { ip, port, interval } = form.value;

  if (!ip.trim()) {
    message.warning(t("ntp.ip_placeholder"));
    return false;
  }

  if (!isValidIP(ip)) {
    message.warning(t("ntp.ip_invalid"));
    return false;
  }

  if (
    port == null ||
    isNaN(port) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    message.warning(t("ntp.port_invalid"));
    return false;
  }

  if (
    interval == null ||
    isNaN(interval) ||
    !Number.isInteger(interval) ||
    interval < 1
  ) {
    message.warning(t("ntp.interval_invalid"));
    return false;
  }

  return true;
};

const handleOk = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;

    const ok = controllerStore.setControllerNtp(props.currentIp, {
      ip: form.value.ip,
      port: Number(form.value.port),
      interval: Number(form.value.interval),
    });

    if (!ok) {
      message.error(t("ntp.controller_not_found"));
      loading.value = false;
      return;
    }

    message.success(t("ntp.save_success"));
    loading.value = false;
    emit("update:modelShow", false);
  } catch (error) {
    console.error("保存NTP配置失败：", error);
    message.error(t("ntp.save_failed"));
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 260px;
  padding: 10px 6px 0 6px;
  overflow-y: auto;

  &-property {
    margin-bottom: 4px;
  }
}
</style>
