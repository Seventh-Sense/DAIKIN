<template>
  <div class="card">
    <div class="card-top">
      <span class="card-title">{{ t("connectivity_check.title") }}</span>
      <div style="display: flex; gap: 12px">
        <a-button type="primary" class="btn-check" @click="onDownload">
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
        <a-progress :percent="30" status="active" />
        <div class="check-action" @click="onCheck(item)">
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
                total: checkResult.comm.total,
                failed: checkResult.comm.failed,
              })
            }}
          </span>
          <span class="result-item">
            {{
              t("connectivity_check.check_result_data", {
                total: checkResult.data.total,
                failed: checkResult.data.failed,
              })
            }}
          </span>
          <span class="result-item">
            {{
              t("connectivity_check.check_result_func", {
                total: checkResult.func.total,
                failed: checkResult.func.failed,
              })
            }}
          </span>
        </div>
      </div>
      <div class="result-btns">
        <a-button type="primary" class="btn-check" @click="onClear()">
          {{ t("connectivity_check.clear") }}
        </a-button>
        <a-button type="primary" class="btn-check" @click="onExport()">
          {{ t("connectivity_check.export_result") }}
        </a-button>
      </div>
    </div>
    <div class="card-area">
      <div v-for="s in strig">
        {{ s }}
      </div>
    </div>
    <div class="card-finish">
      <a-button class="card-btn" @click="onControl()">
        {{ t("connectivity_check.logic_control") }}
      </a-button>
      <a-button type="primary" class="card-btn" @click="onResult()">
        {{ t("connectivity_check.trial_run_result") }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icons from "@/icons/index.vue";
import { useI18n } from "vue-i18n";
import { reactive, ref } from "vue";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";
import { downloadFile, uploadUpgradeFile } from "@/api/modules/page";
import {
  controllerFileName,
  generateConfigZipFile,
  unzipAndReadConfig,
  isDataEqual,
} from "./until";
import { message } from "ant-design-vue";

const controllerStore = useControllerStore();
const stepStore = useStepStore();

const { t } = useI18n();

const downloadLoading = ref(false);

const checkItems = reactive([
  { key: "communication", percent: 30 },
  { key: "data_accuracy", percent: 30 },
  { key: "basic_function", percent: 30 },
]);

const checkResult = reactive({
  comm: { total: 43, failed: 0 }, // 通讯检查
  data: { total: 0, failed: 0 }, // 数据准确性检查
  func: { total: 36, failed: 24 }, // 基本功能检查
});

const strig = [
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
  "检查结果：通讯检查：共检查43项（不通过0项）。",
];

const onDownload = async () => {
  try {
    const currentIP = stepStore.getCurrentIP();
    const localData = controllerStore.getControllerByIp(currentIP);

    if (!localData) {
      console.error("未获取到控制器配置数据");
      message.error(t("msg.config_no_local_data"));
      return;
    }

    console.log("开始下载远程配置文件...", localData);
    const remoteZipBlob = await downloadFile(currentIP, controllerFileName);

    const hasValidData =
      remoteZipBlob &&
      remoteZipBlob.data &&
      typeof remoteZipBlob.data === "string" &&
      Number(remoteZipBlob.file_size) > 0;
    if (!hasValidData) {
      console.error("远程配置文件无效或不存在");
      message.warning(t("msg.config_remote_invalid"));
      await uploadFile(localData);
      return;
    }

    console.log("远程配置文件", remoteZipBlob);

    const remoteData = await unzipAndReadConfig(remoteZipBlob);
    if (!remoteData) {
      console.error("解压远程文件失败");
      message.error(t("msg.config_unzip_failed"));
      return;
    }

    const isSame = isDataEqual(localData, remoteData);
    if (isSame) {
      console.log("配置文件无更新，已是最新版本");
      message.success(t("msg.config_no_update"));
      return;
    }
    
    console.log("配置文件有更新，开始上传...");
    message.info(t("msg.config_has_update"));
    await uploadFile(localData);
  } catch (error) {
    console.error("上传失败", error);
    message.error(t("msg.config_upload_failed"));
  }
};

const uploadFile = async (localData: any) => {
  try {
    const zipFile = await generateConfigZipFile(localData);

    const result: any = await uploadUpgradeFile(
      stepStore.getCurrentIP(),
      zipFile,
      controllerFileName,
    );

    console.log("上传成功", result);
    message.success(t("msg.config_upload_success"));
  } catch (error) {
    console.error("上传失败");
    message.error(t("msg.config_upload_failed"));
  }
};

const onAllCheck = () => {
  console.log("onAllCheck");
};

const onCheck = (data: any) => {
  console.log("onCheck", data);
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
