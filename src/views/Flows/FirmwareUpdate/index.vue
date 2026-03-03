<template>
  <div class="card">
    <div class="card-top">{{ t("firmware.title") }}</div>
    <div class="card-content">
      <div class="card-block">
        <span v-if="file_name !== ''" class="card-tip">
          {{ t("firmware.upgrade_file") }}
        </span>
        <span v-else class="card-tip"></span>
        <a-input
          v-model:value="file_name"
          :placeholder="t('firmware.placeholder.select_file')"
          style="width: 498px"
          :class="{
            'input-success': updateStatus === 'success',
            'input-error': updateStatus === 'error',
          }"
          readonly
        />
      </div>

      <a-button class="card-sbtn" @click="onSelect">
        {{ t("firmware.select_btn") }}
      </a-button>

      <a-button
        type="primary"
        class="card-tbtn"
        @click="startUpdate"
        :disabled="!selectedFile"
      >
        {{ t("firmware.start_btn") }}
      </a-button>
    </div>
    <div v-if="updateStatus === 'success'" class="status-tip success">
      {{ t("firmware.upgrade_success") }}
    </div>
    <div v-if="updateStatus === 'error'" class="status-tip error">
      {{ t("firmware.upgrade_fail") }}
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-btn" @click="onClick">{{
        t("common.edit_complete")
      }}</a-button>
    </div>
  </div>
  <Teleport v-if="isUpgrading" to="body">
    <div class="global-upgrade-mask">
      <div class="upgrade-loading">
        <a-spin size="large" />
        <span class="loading-text">{{ t("firmware.upgrading") }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { handleEditCompleteJump } from "../until/util";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";

const { t } = useI18n();

const file_name = ref<string>("");
const selectedFile = ref<File | null>(null);
const fileContent = ref<string | null>(null);
const isUpgrading = ref<boolean>(false);

const isBodyReady = ref<boolean>(false);

//升级状态
const updateStatus = ref<"idle" | "success" | "error">("idle");

onMounted(() => {
  // 确保DOM完全加载后再允许渲染Teleport
  isBodyReady.value = !!document.body;
});

const onSelect = () => {
  if (isUpgrading.value) return;

  updateStatus.value = "idle";
  file_name.value = "";

  uploadFile((file: File, content: string) => {
    // 可选：文件选择完成后的回调逻辑
    console.log("文件选择完成：", file.name, "内容长度：", content.length);
  });
};

const startUpdate = () => {
  if (!selectedFile.value) {
    message.warning(t("firmware.please_select_file"));
    return;
  }

  try {
    isUpgrading.value = true;

    setTimeout(() => {
      message.success(t("firmware.upgrade_success"));

      updateStatus.value = "error";

      isUpgrading.value = false;
      // 重置状态
      //file_name.value = "";
      selectedFile.value = null;
      fileContent.value = null;
    }, 1500);
  } catch (error) {
    console.error("升级失败：", error);
    message.error(t("firmware.upgrade_fail"));
    updateStatus.value = "error";
    isUpgrading.value = false;
  }
};

const onClick = () => {
  if (isUpgrading.value) return;

  handleEditCompleteJump();
};

const uploadFile = (
  callback: ((file: File, content: string) => void) | null = null,
) => {
  const input = document.createElement("input");

  // 设置文件类型（根据实际固件类型调整，比如.bin/.hex等）
  input.type = "file";
  input.accept = ".bin,.hex,.fw"; // 限定固件文件类型，可根据实际需求修改

  input.onchange = async () => {
    if (!input.files || input.files.length === 0) {
      message.warning(t("firmware.no_file_selected"));
      return;
    }

    const file = input.files[0];
    // 限制文件大小（示例：最大100MB）
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error(t("firmware.file_too_large"));
      return;
    }

    // 更新文件名显示
    file_name.value = file.name;
    // 保存选中的文件对象
    selectedFile.value = file;

    const reader = new FileReader();

    // 读取成功回调
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // 提取Base64内容（去掉dataURL前缀）
      const base64Content = dataUrl.split(",")[1] || "";
      fileContent.value = base64Content;

      // 执行回调
      if (callback) {
        callback(file, base64Content);
      }

      message.success(t("firmware.file_selected", { name: file.name }));
    };

    // 读取失败回调
    reader.onerror = (error) => {
      console.error("文件读取失败：", error);
      message.error(t("firmware.file_read_fail"));
      // 重置状态
      file_name.value = "";
      selectedFile.value = null;
      fileContent.value = null;
    };

    // 以DataURL格式读取文件（适合小文件，大文件建议用FormData）
    reader.readAsDataURL(file);
  };

  // 触发文件选择框点击
  input.click();

  // 移除临时创建的input元素（避免内存泄漏）
  setTimeout(() => {
    input.remove();
  }, 1000);
};
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: 100%;
  padding: 0 24px;

  &-top {
    height: 52px;
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
  }

  &-content {
    display: flex;
    align-items: end;
    gap: 8px;
  }

  &-btn {
    width: 74px;
    height: 32px;
    padding: 0;
    border-radius: 0;
  }

  &-tbtn {
    width: 96px;
    height: 32px;
    padding: 0;
    border-radius: 0;
  }

  &-sbtn {
    width: 70px;
    height: 32px;
    padding: 0;
    border-radius: 0;
    border: 1px solid var(--btn-bg-color);
    color: var(--btn-bg-color);
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
  }

  &-tip {
    font-weight: 400;
    font-size: 12px;
    color: var(--sider-text-color);
    line-height: 17px;
    text-align: left;
    font-style: normal;
    height: 17px;
  }

  &-block {
    display: flex;
    flex-direction: column;
  }
}

.status-tip {
  margin-top: 4px;
  margin-left: 6px;
  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  text-align: left;
  font-style: normal;
  &.success {
    color: var(--success-color); // 成功绿色
  }
  &.error {
    color: var(--fail-color); // 失败红色
  }
}

// 成功状态 - 绿色边框
:deep(.input-success.ant-input) {
  border-bottom-color: var(--success-color) !important;
}

// 失败状态 - 红色边框
:deep(.input-error.ant-input) {
  border-bottom-color: var(--fail-color) !important;
}

:deep(.ant-input) {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--header-text-color);
  padding-left: 0;
}

:deep(.ant-input:focus) {
  box-shadow: none;
}

:deep(.ant-btn-primary:disabled) {
  color: var(--header-bg);
}
</style>

<style lang="less">
.global-upgrade-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--mask-color);
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upgrade-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 60px;
  border-radius: 8px;
}

.loading-text {
  font-weight: bold;
  font-size: 16px;
  color: var(--header-text-color);
  line-height: 24px;
  text-align: center;
  font-style: normal;
}
</style>
