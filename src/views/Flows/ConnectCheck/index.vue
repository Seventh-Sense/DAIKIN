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
      <!-- <a-button
        type="primary"
        class="card-btn"
        @click="onResult()"
        :disabled="downloadLoading"
      >
        {{ t("connectivity_check.trial_run_result") }}
      </a-button> -->
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
  writePointValue,
} from "@/api/modules/page";
import {
  controllerFileName,
  generateConfigZipFile,
  unzipAndReadConfig,
  isDataEqual,
  getAllPointsInfo,
  resetCheckStatus,
  getPointType,
} from "./until";
import { message } from "ant-design-vue";
import { getControllerType } from "../DeviceManage/utils/utils";
import { exportToExcel, SheetConfig } from "../DeviceManage/utils/xlsx";
import { useLocaleStore } from "@/pinia/modules/locale";

const controllerStore = useControllerStore();
const stepStore = useStepStore();
const localeStore = useLocaleStore();

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
const exportCheckResults = ref<
  Array<{
    devicePath: string;
    checkDesc: string;
    checkResult: string;
  }>
>([]);

const points = ref<any[]>([]);

const typeMap = { 1: "pro", 2: "standard", 3: "lite" };

onMounted(() => {
  //获取控制器所有点位信息
  points.value = localData ? getAllPointsInfo(localData) || [] : [];
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

const onAllCheck = async () => {
  if (downloadLoading.value) return;

  // 空点位安全判断
  if (!points.value || points.value.length === 0) {
    message.warning(t("msg.no_points"));
    return;
  }

  downloadLoading.value = true;
  resultInfo.value = [];
  exportCheckResults.value = [];

  checkItems.forEach((item) => {
    item.percent = 0;
    item.total = 0;
    item.failed = 0;
  });

  try {
    // 2. 按顺序执行：通讯 → 数据准确性 → 基本功能
    addLog("time", "msg.all_check_start"); // 开始全部检查

    await runCommunicationCheck();
    await new Promise((resolve) => setTimeout(resolve, 300)); // 轻微间隔，体验更顺滑

    await runDataAccuracyCheck();
    await new Promise((resolve) => setTimeout(resolve, 300));

    await runBasicFunctionCheck();

    addLog("time", "msg.all_check_finish"); // 全部检查完成
    message.success(t("msg.all_check_success"));
  } catch (err) {
    console.error("全部检查异常", err);
    message.error(t("msg.all_check_failed"));
  } finally {
    downloadLoading.value = false;
  }
};

const onCheck = async (key: any) => {
  if (downloadLoading.value) return;

  // 空点位安全判断
  if (!points.value || points.value.length === 0) {
    message.warning(t("msg.no_points"));
    return;
  }

  downloadLoading.value = true;
  resultInfo.value = [];
  exportCheckResults.value = [];

  checkItems.forEach((item) => {
    // 不是当前点击的项，就清空进度、总数、失败数
    if (item.index !== key) {
      item.percent = 0;
      item.total = 0;
      item.failed = 0;
    }
  });

  try {
    switch (key) {
      case 1:
        // 执行通讯检查逻辑
        await runCommunicationCheck();
        break;
      case 2:
        // 执行数据准确性检查逻辑
        await runDataAccuracyCheck();
        break;
      case 3:
        // 执行基本功能检查逻辑
        await runBasicFunctionCheck();
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("单项检查异常", err);
  } finally {
    downloadLoading.value = false;
  }
};

const runCommunicationCheck = async () => {
  const commItem = checkItems[0];

  resetCheckStatus(commItem);

  const totalPoints = points.value.length;
  let successCount = 0;
  let failCount = 0;

  //通讯检查开始
  addLog("time", "msg.communication_start");

  for (const item of points.value) {
    try {
      console.log("item", item);
      const result = await readPointValue({
        device_address: currentIP,
        device_type: item?.device_type || "",
        device_uid: item?.device_uid || "",
        points: [
          {
            point_uid: item?.point_uid || "",
            data_type: item?.data_type || "",
            priority: 16,
          },
        ],
      });

      if (result.success && result.points && result.points.length > 0) {
        const reliability = result.points[0].reliability;

        if (reliability !== 12) {
          item.status = "success";
          successCount++;

          addLog(
            "point",
            "msg.point_check_success",
            {},
            true,
            item.device_name,
            item.point_name,
          );
        } else {
          item.status = "failed";
          failCount++;

          addLog(
            "point",
            "msg.point_check_unreliability",
            {},
            false,
            item.device_name,
            item.point_name,
          );
        }
      } else {
        item.status = "failed";
        failCount++;

        addLog(
          "point",
          "msg.point_check_failed",
          {},
          false,
          item.device_name,
          item.point_name,
        );
      }
    } catch (error) {
      console.error(`点位 读取失败：`, error);

      item.status = "failed";
      failCount++;

      addLog(
        "point",
        "msg.point_check_failed",
        {},
        false,
        item.device_name,
        item.point_name,
      );
    }

    commItem.total = successCount + failCount;
    commItem.failed = failCount;
    commItem.percent = Math.round(
      ((successCount + failCount) / totalPoints) * 100,
    );
  }

  commItem.percent = 100;

  addLog("time", "msg.communication_finish");
};

const runDataAccuracyCheck = async () => {
  const commItem = checkItems[1];

  resetCheckStatus(commItem);

  const totalPoints = points.value.length;
  let successCount = 0;
  let failCount = 0;

  addLog("time", "msg.data_accuracy_start");

  for (const item of points.value) {
    try {
      const result = await readPointValue({
        device_address: currentIP,
        device_type: item?.device_type || "",
        device_uid: item?.device_uid || "",
        points: [
          {
            point_uid: item?.point_uid || "",
            data_type: item?.data_type || "",
            priority: 16,
          },
        ],
      });

      if (
        result.success &&
        result.points &&
        result.points.length > 0 &&
        result.points[0]?.present_value !== undefined
      ) {
        item.status = "success";
        const value = Number(result.points[0].present_value);

        let isValueValid = false;

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

          addLog(
            "text",
            "msg.data_valid_range_format",
            {
              value: value,
              min: item.min ?? "-Infinity",
              max: item.max ?? "Infinity",
            },
            true,
            item.device_name,
            item.point_name,
          );
        } else {
          failCount++;
          item.status = "failed";
          addLog(
            "text",
            "msg.data_invalid_range_format",
            {
              value: value,
              min: item.min ?? "-Infinity",
              max: item.max ?? "Infinity",
            },
            false,
            item.device_name,
            item.point_name,
          );
        }
      } else {
        item.status = "failed";
        failCount++;

        addLog(
          "point",
          "msg.point_check_failed",
          {},
          false,
          item.device_name,
          item.point_name,
        );
      }
    } catch (error) {
      console.error(`点位 读取失败：`, error);

      item.status = "failed";
      failCount++;

      addLog(
        "point",
        "msg.point_check_failed",
        {},
        false,
        item.device_name,
        item.point_name,
      );
    }

    commItem.total = successCount + failCount;
    commItem.failed = failCount;
    commItem.percent = Math.round(
      ((successCount + failCount) / totalPoints) * 100,
    );
  }

  commItem.percent = 100;

  addLog("time", "msg.data_accuracy_finish");
};

const runBasicFunctionCheck = async () => {
  const commItem = checkItems[2];

  resetCheckStatus(commItem);

  const totalPoints = points.value.length;
  let successCount = 0;
  let failCount = 0;

  addLog("time", "msg.basic_func_start");

  // 统一日志方法，简化代码
  const logPoint = (
    msgKey: string,
    success: boolean,
    deviceName: any,
    pointName: any,
  ) => {
    addLog("point", msgKey, {}, success, deviceName, pointName);
  };

  // 统一点位状态失败处理
  const handlePointFail = (item: any, msgKey: string) => {
    item.status = "failed";
    failCount++;
    logPoint(msgKey, false, item.device_name, item.point_name);
  };

  const isWriteSuccess = (res: any) => {
    return res.success && res.points?.length && res.points[0]?.success;
  };

  const updateProgress = () => {
    commItem.total = successCount + failCount;
    commItem.failed = failCount;
    commItem.percent = Math.round(
      ((successCount + failCount) / totalPoints) * 100,
    );
  };

  for (const item of points.value) {
    try {
      //先读值
      const readResult = await readPointValue({
        device_address: currentIP,
        device_type: item?.device_type || "",
        device_uid: item?.device_uid || "",
        points: [
          {
            point_uid: item?.point_uid || "",
            data_type: item?.data_type || "",
            priority: 16,
          },
        ],
      });

      const isValidRead =
        readResult.success &&
        readResult.points?.length &&
        readResult.points[0]?.present_value !== undefined;

      if (!isValidRead) {
        handlePointFail(item, "msg.point_check_failed");
        updateProgress();
        continue;
      }

      //判断是否可写
      if (!item.writable) {
        logPoint(
          "msg.data_set_no_writable",
          true,
          item.device_name,
          item.point_name,
        );
        successCount++;
        updateProgress();
        continue;
      }

      const originalValue = Number(readResult.points[0].present_value);
      const pointType = getPointType(item.device_type, item.data_type);

      //模拟量处理：+1 写入 → -1 写入
      if (pointType === "analog") {
        const raw = readResult.points[0].present_value;
        const writeValue = Number.isInteger(raw) ? raw + 1.000000001 : raw + 1;

        const addRes = await writePointValue({
          device_address: currentIP,
          device_type: item.device_type,
          device_uid: item.device_uid,
          points: [
            {
              point_uid: item.point_uid,
              data_type: item.data_type,
              value: writeValue,
              priority: 16,
            },
          ],
        });

        if (!isWriteSuccess(addRes)) {
          handlePointFail(item, "msg.data_set_failed");
          updateProgress();
          continue;
        }

        const restoreValue = Number.isInteger(raw) ? raw + 0.000000001 : raw;

        const subRes = await writePointValue({
          device_address: currentIP,
          device_type: item.device_type,
          device_uid: item.device_uid,
          points: [
            {
              point_uid: item.point_uid,
              data_type: item.data_type,
              value: restoreValue,
              priority: 16,
            },
          ],
        });

        if (isWriteSuccess(subRes)) {
          successCount++;
          logPoint(
            "msg.data_set_success",
            true,
            item.device_name,
            item.point_name,
          );
        } else {
          handlePointFail(item, "msg.data_set_failed");
        }
      } else if (pointType === "binary") {
        const originalBool = originalValue === 1;
        const reverseBool = !originalBool;

        const reverseRes = await writePointValue({
          device_address: currentIP,
          device_type: item.device_type,
          device_uid: item.device_uid,
          points: [
            {
              point_uid: item.point_uid,
              data_type: item.data_type,
              value: reverseBool,
              priority: 16,
            },
          ],
        });

        if (!isWriteSuccess(reverseRes)) {
          handlePointFail(item, "msg.data_set_failed");
          updateProgress();
          continue;
        }

        const restoreRes = await writePointValue({
          device_address: currentIP,
          device_type: item.device_type,
          device_uid: item.device_uid,
          points: [
            {
              point_uid: item.point_uid,
              data_type: item.data_type,
              value: originalBool,
              priority: 16,
            },
          ],
        });

        if (isWriteSuccess(restoreRes)) {
          successCount++;
          logPoint(
            "msg.data_set_success",
            true,
            item.device_name,
            item.point_name,
          );
        } else {
          handlePointFail(item, "msg.data_set_failed");
        }
      } else {
        const addRes = await writePointValue({
          device_address: currentIP,
          device_type: item.device_type,
          device_uid: item.device_uid,
          points: [
            {
              point_uid: item.point_uid,
              data_type: item.data_type,
              value: originalValue + 1,
              priority: 16,
            },
          ],
        });

        if (!isWriteSuccess(addRes)) {
          // 先减一
          const subRes = await writePointValue({
            device_address: currentIP,
            device_type: item.device_type,
            device_uid: item.device_uid,
            points: [
              {
                point_uid: item.point_uid,
                data_type: item.data_type,
                value: originalValue - 1,
                priority: 16,
              },
            ],
          });

          if (!isWriteSuccess(subRes)) {
            handlePointFail(item, "msg.data_set_failed");
            updateProgress();
            continue;
          }
        }

        const finalSubRes = await writePointValue({
          device_address: currentIP,
          device_type: item.device_type,
          device_uid: item.device_uid,
          points: [
            {
              point_uid: item.point_uid,
              data_type: item.data_type,
              value: originalValue,
              priority: 16,
            },
          ],
        });

        if (isWriteSuccess(finalSubRes)) {
          successCount++;
          logPoint(
            "msg.data_set_success",
            true,
            item.device_name,
            item.point_name,
          );
        } else {
          handlePointFail(item, "msg.data_set_failed");
        }
      }
    } catch (error) {
      console.error(`点位 读取失败：`, error);
      handlePointFail(item, "msg.point_check_failed");
    }

    updateProgress();
  }

  commItem.percent = 100;
  addLog("time", "msg.basic_func_finish");
};

const onClear = () => {
  resultInfo.value = [];
  exportCheckResults.value = [];

  checkItems.forEach((item) => {
    item.percent = 0;
    item.total = 0;
    item.failed = 0;
  });

  if (points.value && points.value.length) {
    points.value.forEach((item) => {
      item.status = undefined;
    });
  }

  message.success(t("msg.clear_success"));
};

const onExport = () => {
  if (!exportCheckResults.value || exportCheckResults.value.length === 0) {
    message.warning(t("msg.export_check_no_data")); // 无检查数据，无法导出
    return;
  }

  try {
    const sheets = [
      {
        sheetName: "CheckResult",
        data: exportCheckResults.value,
        // 直接英文表头
        formatter: (item: any) => ({
          "Device Path": item.devicePath,
          "Check Description": item.checkDesc,
          "Check Result": item.checkResult,
        }),
      },
    ];

    const fileName = `Connectivity_Check_${Date.now()}`;

    exportToExcel(sheets, fileName);

    message.success(t("msg.export_check_success"));
  } catch (error) {
    console.error("导出失败", error);
    message.error(t("msg.export_check_failed"));
  }
};

const onControl = () => {
  let ip = stepStore.currentMenuData.data.address;
  let device = stepStore.currentMenuData.data.name;

  let name = window.location.hostname;
  const currentLocale = localeStore.currentLocale;

  window.open(`http://${name}:3000/#/daikin/${ip}/${device}/` + currentLocale, "_blank");
};

const onResult = () => {
  console.log("onResult");
};

const addLog = (
  type: "time" | "point" | "text",
  msgKey: string,
  params: Record<string, any> = {},
  status?: boolean,
  deviceName?: string,
  pointName?: string,
) => {
  const timePrefix = type === "time" ? `[${new Date().toLocaleString()}] ` : "";

  const icon = status === true ? " ✅" : status === false ? " ❌" : "";

  const pointPrefix =
    deviceName && pointName ? `${deviceName} ${pointName} ` : "";

  const text = t(msgKey, params);

  resultInfo.value.push(`${timePrefix}${pointPrefix}${text}${icon}`);

  //存储结果为 路径 + 描述 + 检查结果
  if (type === "time") {
    exportCheckResults.value.push({
      devicePath: timePrefix + text,
      checkDesc: "",
      checkResult: "",
    });
  } else {
    exportCheckResults.value.push({
      devicePath: pointPrefix,
      checkDesc: status ? "Status is OK" : "Status is Failed",
      checkResult: status ? "Check Passed" : "Check Failed",
    });
  }
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
