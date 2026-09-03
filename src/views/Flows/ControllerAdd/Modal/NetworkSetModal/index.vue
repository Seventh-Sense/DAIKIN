<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('device_info.modify_device_address')"
    :width="600"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    :confirmLoading="loading"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-porperty">{{ $t("device_info.ip_address") }}</div>
      <a-input
        v-model:value="data.ip"
        style="margin-bottom: 12px"
        :placeholder="t('device_info.please_enter_ip')"
      />
      <div class="modal-porperty">{{ $t("device_info.subnet_mask") }}</div>
      <a-input
        v-model:value="data.mask"
        style="margin-bottom: 12px"
        :placeholder="t('device_info.please_enter_mask')"
      />
      <div class="modal-porperty">{{ $t("device_info.gateway") }}</div>
      <a-input
        v-model:value="data.gw"
        style="margin-bottom: 12px"
        :placeholder="t('device_info.please_enter_gw')"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {
  fetchTaskStatus,
  rebootColdDevice,
  rebootDevice,
  setConfigFile,
  uploadUpgradeFile,
} from "@/api/modules/page";
import { isValidIP } from "@/utils/function";
import { message } from "ant-design-vue";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStepStore } from "@/pinia/modules/step";
import { getControllerType } from "@/views/Flows/DeviceManage/utils/utils";

const stepStore = useStepStore();

const { t } = useI18n();

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  fileName: {
    type: String,
    default: "eth.json",
  },
});

const emit = defineEmits(["update:modelShow"]);

const loading = ref(false);

const data = ref<any>({
  ip: "",
  mask: "255.255.255.0",
  gw: "",
});

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
};

const validateForm = () => {
  const { ip, mask, gw } = data.value;

  if (!ip.trim()) {
    message.warning(t("device_info.please_enter_ip"));
    return false;
  }

  if (!isValidIP(ip)) {
    message.warning(t("device_info.ip_format_error"));
    return false;
  }

  if (!mask.trim()) {
    message.warning(t("device_info.please_enter_mask"));
    return false;
  }

  if (!isValidIP(mask)) {
    message.warning(t("device_info.mask_format_error"));
    return false;
  }

  if (!gw.trim()) {
    message.warning(t("device_info.please_enter_gw"));
    return false;
  }

  if (!isValidIP(gw)) {
    message.warning(t("device_info.gw_format_error"));
    return false;
  }
  return true;
};

const taskID = ref("");
let checkTaskTimer: any = null;
const progress = ref<number>(0);

const handleOk = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;

    const ethJson = {
      ip: data.value.ip,
      mask: data.value.mask,
      gw: data.value.gw,
      dhcpEn: 0,
    };

    const blob = new Blob([JSON.stringify(ethJson, null, 2)], {
      type: "application/json",
    });
    const ethFile = new File([blob], props.fileName, {
      type: "application/json",
    });

    const currentIP = stepStore.currentMenuData.label;

    const result = await uploadUpgradeFile(
      currentIP,
      ethFile,
      `eth/${props.fileName}`,
    );

    if (!result || !result.task_id) {
      message.error(t("device_info.modify_failed"));
      loading.value = false;
      return;
    }

    taskID.value = result.task_id;

    clearTime();

    checkTaskTimer = setInterval(async () => {
      try {
        if (!taskID.value) {
          clearTime();
          return;
        }

        const res = await fetchTaskStatus(taskID.value);

        progress.value = Math.floor(res.progress);

        if (res.progress === 100) {
          clearTime();
          taskID.value = "";

          message.success(t("device_info.modify_success"));
          setTimeout(() => {
            loading.value = false;
            emit("update:modelShow", false);
          }, 1000);

          rebootColdDevice(stepStore.getCurrentIP());
        }
      } catch (err) {
        console.error("查询进度失败：", err);
        clearTime();
        message.error(t("device_info.modify_failed"));
        loading.value = false;
        taskID.value = "";
      }
    }, 1500);
  } catch (error) {
    console.error("保存网络设置失败：", error);
    message.error(t("device_info.save_network_config_error"));
  }
};

const clearTime = () => {
  if (checkTaskTimer !== null) {
    clearInterval(checkTaskTimer);
    checkTaskTimer = null;
  }
};
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 300px;
  padding: 10px 6px 0 6px;
  overflow-y: auto;

  &-porperty {
    margin-bottom: 4px;
  }
}
</style>
