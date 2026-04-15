<template>
  <div class="card">
    <div class="card-top">
      <span class="card-title">{{ t("connectivity_check.title") }}</span>
      <div style="display: flex; gap: 12px">
        <a-button
          type="primary"
          class="btn-check"
          @click="onDownload"
          :disabled="downloadLoading"
        >
          {{ t("connectivity_check.download_file") }}
        </a-button>
        <a-button
          type="primary"
          class="btn-check"
          @click="onAllCheck"
          :disabled="downloadLoading"
        >
          {{ t("connectivity_check.all_check") }}
        </a-button>
      </div>
    </div>
    <div class="card-flows">
      <div
        class="card-flows-block"
        v-for="(item, index) in checkItems"
        :key="index"
      >
        <span>{{ t(`connectivity_check.${item.key}`) }}</span>
        <a-progress :percent="item.percent" status="active" />
        <div
          class="check-action"
          @click="onCheck(item.index)"
          :class="{ disabled: downloadLoading }"
        >
          <Icons
            name="search"
            type="mono-line"
            :size="20"
            :color="{ normal: '#222222' }"
          />
          <span>{{ t("connectivity_check.check") }}</span>
        </div>
      </div>
    </div>
    <div class="card-result">
      <div class="result-text">
        <span class="result-label">
          {{ t("connectivity_check.check_result_label") }}：
        </span>
        <div class="result-items">
          <span class="result-item">
            {{
              t("connectivity_check.check_result_comm", {
                total: checkItems[0].total,
                failed: checkItems[0].failed,
              })
            }}
          </span>
          <span class="result-item">
            {{
              t("connectivity_check.check_result_data", {
                total: checkItems[1].total,
                failed: checkItems[1].failed,
              })
            }}
          </span>
          <span class="result-item">
            {{
              t("connectivity_check.check_result_func", {
                total: checkItems[2].total,
                failed: checkItems[2].failed,
              })
            }}
          </span>
        </div>
      </div>
      <div class="result-btns">
        <a-button
          type="primary"
          class="btn-check"
          @click="onClear()"
          :disabled="downloadLoading"
        >
          {{ t("connectivity_check.clear") }}
        </a-button>
        <a-button
          type="primary"
          class="btn-check"
          @click="onExport()"
          :disabled="downloadLoading"
        >
          {{ t("connectivity_check.export_result") }}
        </a-button>
      </div>
    </div>
    <div class="card-area">
      <div v-for="info in resultInfo">
        {{ info }}
      </div>
    </div>
    <div class="card-finish">
      <a-button
        class="card-btn"
        @click="onControl()"
        :disabled="downloadLoading"
      >
        {{ t("connectivity_check.logic_control") }}
      </a-button>
      <a-button
        type="primary"
        class="card-btn"
        @click="onResult()"
        :disabled="downloadLoading"
      >
        {{ t("connectivity_check.trial_run_result") }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icons from "@/icons/index.vue";
import { useI18n } from "vue-i18n";
import { onMounted, reactive, ref } from "vue";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";
import {
  downloadFile,
  readPointValue,
  rebootDevice,
  setConfigFile,
} from "@/api/modules/page";
import {
  controllerFileName,
  generateConfigZipFile,
  unzipAndReadConfig,
  isDataEqual,
  getAllPointsInfo,
  resetCheckStatus,
} from "./until";
import { message } from "ant-design-vue";
import { getControllerType } from "../DeviceManage/utils/utils";

const controllerStore = useControllerStore();
const stepStore = useStepStore();

const { t } = useI18n();

const downloadLoading = ref(false);
const currentIP = stepStore.getCurrentIP();
const localData = controllerStore.getControllerByIp(currentIP);

const checkItems = reactive([
  { key: "communication", percent: 0, index: 1, total: 0, failed: 0 },
  { key: "data_accuracy", percent: 0, index: 2, total: 0, failed: 0 },
  { key: "basic_function", percent: 0, index: 3, total: 0, failed: 0 },
]);

const resultInfo = ref<string[]>([]);
const points = ref<any[]>([]);

const typeMap = { 1: "pro", 2: "standard", 3: "lite" };

onMounted(() => {
  //获取控制器所有点位信息
  points.value = getAllPointsInfo(localData);
});

const onDownload = async () => {
  if (downloadLoading.value) return;
  downloadLoading.value = true;

  try {
    if (!localData) {
      message.error(t("msg.config_no_local_data"));
      return;
    }

    const remoteZipBlob = await downloadFile(currentIP, controllerFileName);

    const hasValidData =
      remoteZipBlob &&
      remoteZipBlob.data &&
      typeof remoteZipBlob.data === "string" &&
      Number(remoteZipBlob.file_size) > 0;

    if (!hasValidData) {
      message.warning(t("msg.config_remote_invalid"));
      await uploadFile(localData);
      return;
    }

    const remoteData = await unzipAndReadConfig(remoteZipBlob);
    if (!remoteData) {
      message.error(t("msg.config_unzip_failed"));
      return;
    }

    if (isDataEqual(localData, remoteData)) {
      message.success(t("msg.config_no_update"));
      return;
    }

    message.info(t("msg.config_has_update"));
    await uploadFile(localData);
  } catch (error) {
    console.error("上传失败", error);
    message.error(t("msg.config_upload_failed"));
  } finally {
    downloadLoading.value = false;
  }
};

const uploadFile = async (localData: any) => {
  try {
    const zipFile = await generateConfigZipFile(localData);
    const controllerType = getControllerType(stepStore.currentStep);

    const result = await setConfigFile(
      currentIP,
      zipFile,
      typeMap[controllerType],
    );

    message.success(t("msg.config_upload_success"));

    //发送reboot
    rebootDevice(currentIP);
  } catch (error) {
    console.error("上传失败");
    message.error(t("msg.config_upload_failed"));
  }
};

const onAllCheck = () => {
  if (downloadLoading.value) return;
};

const onCheck = async (key: any) => {
  if (downloadLoading.value) return;

  downloadLoading.value = true;
  resultInfo.value = [];

  try {
    switch (key) {
      case 1:
        // 执行通讯检查逻辑
        runCommunicationCheck();
        break;
      case 2:
        // 执行数据准确性检查逻辑
        runDataAccuracyCheck();
        break;
      case 3:
        // 执行基本功能检查逻辑
        runBasicFunctionCheck();
        break;
      default:
        break;
    }

    //await new Promise((resolve) => setTimeout(resolve, 3000));
  } finally {
    downloadLoading.value = false;
  }
};

const runCommunicationCheck = async () => {
  const commItem = checkItems[0];

  resetCheckStatus(commItem);

  if (!points.value || points.value.length === 0) {
    message.warning(t("msg.no_points"));
    return;
  }

  const totalPoints = points.value.length;
  let successCount = 0;
  let failCount = 0;

  //通讯检查开始
  addTimeLog("msg.communication_start");

  for (const item of points.value) {
    try {
      const result = await readPointValue(item.device_uid, item.point_uid);

      if (result.status === "OK") {
        item.status = "success";
        successCount++;

        addPointLog(
          item.device_name,
          item.point_name,
          "msg.point_check_success",
          true,
        );
      } else {
        item.status = "failed";
        failCount++;

        addPointLog(
          item.device_name,
          item.point_name,
          "msg.point_check_failed",
          false,
        );
      }
    } catch (error) {
      console.error(`点位 读取失败：`, error);

      item.status = "failed";
      failCount++;

      addPointLog(
        item.device_name,
        item.point_name,
        "msg.point_check_failed",
        false,
      );
    }

    commItem.total = successCount + failCount;
    commItem.failed = failCount;
    commItem.percent = Math.round(
      ((successCount + failCount) / totalPoints) * 100,
    );
  }

  commItem.percent = 100;

  addTimeLog("msg.communication_finish");
};

const runDataAccuracyCheck = async () => {
  const commItem = checkItems[1];

  resetCheckStatus(commItem);

  if (!points.value || points.value.length === 0) {
    message.warning(t("msg.no_points"));
    return;
  }

  const totalPoints = points.value.length;
  let successCount = 0;
  let failCount = 0;

  addTimeLog("msg.data_accuracy_start");

  console.log(points.value);
  for (const item of points.value) {
    try {
      const result = await readPointValue(item.device_uid, item.point_uid);
      if (result.status === "OK") {
        item.status = "success";
        const value = Number(result.value);

        let isValueValid = false;
        let logText = "";

        if (item.min !== undefined && item.max === undefined) {
          isValueValid = value >= item.min;
        }
        // 场景2：只有 max
        else if (item.max !== undefined && item.min === undefined) {
          isValueValid = value <= item.max;
        }
        // 场景3：min + max 都存在
        else if (item.min !== undefined && item.max !== undefined) {
          isValueValid = value >= item.min && value <= item.max;
        }
        // 场景4：无范围限制 → 默认通过
        else {
          isValueValid = true;
        }

        if (isValueValid) {
          successCount++;

          resultInfo.value.push(
            `${item.device_name} ${item.point_name} ${t(
              "msg.data_valid_range_format",
              {
                value: value,
                min: item.min ?? "-Infinity",
                max: item.max ?? "Infinity",
              },
            )}  ✅`,
          );
        } else {
          failCount++;
          item.status = "failed";
          resultInfo.value.push(
            `${item.device_name} ${item.point_name} ${t(
              "msg.data_invalid_range_format",
              {
                value: value,
                min: item.min ?? "-Infinity",
                max: item.max ?? "Infinity",
              },
            )}  ❌`,
          );
        }
      } else {
        item.status = "failed";
        failCount++;

        addPointLog(
          item.device_name,
          item.point_name,
          "msg.point_check_failed",
          false,
        );
      }
    } catch (error) {
      console.error(`点位 读取失败：`, error);

      item.status = "failed";
      failCount++;

      addPointLog(
        item.device_name,
        item.point_name,
        "msg.point_check_failed",
        false,
      );
    }

    commItem.total = successCount + failCount;
    commItem.failed = failCount;
    commItem.percent = Math.round(
      ((successCount + failCount) / totalPoints) * 100,
    );
  }

  commItem.percent = 100;

  addTimeLog("msg.data_accuracy_finish");
};

const runBasicFunctionCheck = async () => {
  const commItem = checkItems[2];

  resetCheckStatus(commItem);

  if (!points.value || points.value.length === 0) {
    message.warning(t("msg.no_points"));
    return;
  }
};

const onClear = () => {
  console.log("onClear");
};

const onExport = () => {
  console.log("onExport");
};

const onControl = () => {
  console.log("onControl");
};

const onResult = () => {
  console.log("onResult");
};

const addTimeLog = (msgKey: string) => {
  resultInfo.value.push(`[${new Date().toLocaleString()}] ${t(msgKey)}`);
};

const addPointLog = (
  deviceName: string,
  pointName: string,
  msgKey: string,
  status: boolean,
) => {
  let icon = "✅";
  if (!status) {
    icon = "❌";
  }
  resultInfo.value.push(`${deviceName} ${pointName} ${t(msgKey)}  ${icon}`);
};
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: calc(100vh - 80px);
  padding: 0 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &-top {
    height: 52px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  &-title {
    font-weight: bold;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
    flex-shrink: 0;
  }

  &-flows {
    min-height: 120px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      min-height: auto;
      gap: 20px;
    }

    &-block {
      height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      background-color: var(--topic-card-bg-color);
      padding: 6px;
      border-radius: 6px;

      @media (max-width: 768px) {
        min-height: auto;
      }

      .check-action {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
    }
  }

  &-btn {
    border-radius: 0;
  }

  &-result {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    flex-shrink: 0;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 12px;
      height: auto;
    }

    .result-text {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        width: 100%; // 小屏幕下占满宽度
      }

      .result-items {
        display: flex;
        flex-wrap: wrap; // 新增：结果项换行
        gap: 8px 16px;

        @media (max-width: 768px) {
          width: 100%;
          margin-top: 4px;
        }
      }

      .result-item {
        white-space: nowrap;

        @media (max-width: 768px) {
          font-size: 12px;
        }
      }
    }

    .result-btns {
      display: flex;
      gap: 12px;

      @media (max-width: 768px) {
        width: 100%; // 小屏幕下占满宽度
        justify-content: flex-end;
      }
    }
  }

  &-area {
    flex: 1;
    background-color: var(--topic-card-bg-color);
    border-radius: 6px;
    margin-top: 8px;
    margin-bottom: 60px;
    max-height: calc(100% - 60px);
    overflow-y: auto;
    padding: 6px;
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.btn-check {
  border-radius: 0;
}
</style>
