<template>
  <div class="card">
    <div class="card-top">{{ t("mqtt.title") }}</div>
    <div class="card-content">
      <div class="card-content-top">
        <div class="card-content-block">
          <span class="card-content-text">{{ t("mqtt.host") }}</span>
          <a-input
            v-model:value="info.host"
            style="width: 100%"
            placeholder="47.103.19.245"
          />
        </div>
        <div class="card-content-block">
          <span class="card-content-text">{{ t("mqtt.port") }}</span>
          <a-input
            v-model:value="info.port"
            style="width: 100%"
            placeholder="1888"
          />
        </div>
        <div class="card-content-block">
          <span class="card-content-text">{{ t("login.username") }}</span>
          <a-input
            v-model:value="info.username"
            autocomplete="off"
            style="width: 100%"
          />
        </div>
        <div class="card-content-block">
          <span class="card-content-text">{{ t("login.password") }}</span>
          <a-input-password
            v-model:value="info.password"
            autocomplete="new-password"
            style="width: 100%"
          />
        </div>
        <div class="card-content-block">
          <span class="card-content-text">{{ t("mqtt.encode_format") }}</span>
          <a-input-number
            v-model:value="info.encode_format"
            :min="0"
            style="width: 100%"
          />
        </div>
        <div class="card-content-block">
          <span class="card-content-text">{{ t("mqtt.last_will_topic") }}</span>
          <a-input v-model:value="info.last_will_topic" style="width: 100%" />
        </div>
      </div>

      <div class="card-content-file">
        <div class="card-content-block">
          <span class="card-content-text">{{ t("mqtt.ca_certificate") }}</span>
          <input
            type="file"
            style="display: none"
            id="caCertFile"
            accept=".pem,.crt,.cer"
            @change="handleCaCertUpload"
          />
          <div class="file-input-row">
            <a-input
              v-model:value="info.ca_filename"
              style="width: 100%"
              :placeholder="t('mqtt.ca_cert_placeholder')"
              readonly
              @click="openFileUpload('ca')"
            />
            <Icons
              name="delete"
              type="mono-line"
              :size="20"
              :color="{ normal: '#222222' }"
              @click="clearCert('ca')"
            />
          </div>
        </div>
        <div class="card-content-block">
          <span class="card-content-text">
            {{ t("mqtt.client_certificate") }}
          </span>
          <input
            type="file"
            style="display: none"
            id="clientCertFile"
            accept=".pem,.crt,.cer"
            @change="handleClientCertUpload"
          />
          <div class="file-input-row">
            <a-input
              v-model:value="info.client_cert_filename"
              style="width: 100%"
              :placeholder="t('mqtt.client_cert_placeholder')"
              readonly
              @click="openFileUpload('clientCert')"
            />
            <Icons
              name="delete"
              type="mono-line"
              :size="20"
              :color="{ normal: '#222222' }"
              @click="clearCert('clientCert')"
            />
          </div>
        </div>
        <div class="card-content-block">
          <span class="card-content-text">{{ t("mqtt.client_key") }}</span>
          <input
            type="file"
            style="display: none"
            id="clientKeyFile"
            accept=".pem,.key"
            @change="handleClientKeyUpload"
          />
          <div class="file-input-row">
            <a-input
              v-model:value="info.client_key_filename"
              style="width: 100%"
              :placeholder="t('mqtt.client_key_placeholder')"
              readonly
              @click="openFileUpload('clientKey')"
            />
            <Icons
              name="delete"
              type="mono-line"
              :size="20"
              :color="{ normal: '#222222' }"
              @click="clearCert('clientKey')"
            />
          </div>
        </div>
      </div>

      <div class="card-content-row">
        <span class="card-content-row-title">{{ t("mqtt.topics") }}</span>
        <a-button type="primary" class="card-btn-add" @click="onAdd">
          {{ t("mqtt.add") }}
          <Icons
            name="addCircle"
            type="mono-line"
            :size="20"
            :color="{ normal: '#ffffff' }"
          />
        </a-button>
      </div>
      <div class="card-content-list">
        <TopicCard
          v-for="(item, index) in list"
          :key="index"
          :data="item"
          @update="handleUpdate(index, $event)"
          @delete="handleDelete(index)"
        />
      </div>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
    <TopicModal
      v-if="showModal"
      v-model:modelShow="showModal"
      :List="list"
      :sns="options"
      @add="handleAdd"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { handleEditCompleteJump } from "../until/util";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";
import TopicCard from "./TopicCard/index.vue";
import TopicModal from "./TopicModal/index.vue";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";
import { message } from "ant-design-vue";
import { BooleanOption } from "../DeviceManage/utils/options";

const stepStore = useStepStore();
const controllerStore = useControllerStore();
const { t } = useI18n();

const options = ref<any[]>([]);
const showModal = ref(false);

const info = reactive({
  host: "",
  port: "",
  username: "",
  password: "",
  encode_format: 1,
  last_will_topic: "",
  ca_filename: "",
  ca_certificate: "",
  client_cert_filename: "",
  client_certificate: "",
  client_key_filename: "",
  client_key: "",
});

const list = reactive<any[]>([]);

const clearInfo = () => {
  Object.assign(info, {
    host: "",
    port: "",
    username: "",
    password: "",
    last_will_topic: "",
    ca_filename: "",
    ca_certificate: "",
    client_cert_filename: "",
    client_certificate: "",
    client_key_filename: "",
    client_key: "",
  });
  list.length = 0;
};

const initData = () => {
  clearInfo();

  const currentIP = stepStore.getCurrentIP();
  const controllerData = controllerStore.getControllerByIp(currentIP);

  if (controllerData === undefined) {
    message.error(t("mqtt.controller_not_found"));
    return;
  }

  const { mqtt, devices } = controllerData;

  if (mqtt) {
    info.host = mqtt.host || "";
    info.port = mqtt.port || "";
    info.username = mqtt.username || "";
    info.password = mqtt.password || "";
    info.encode_format = Number(mqtt.encode_format);
    info.last_will_topic = mqtt.last_will_topic || "";
    info.ca_filename = mqtt.ca_filename || "";
    info.ca_certificate = mqtt.ca_certificate || "";
    info.client_cert_filename = mqtt.client_cert_filename || "";
    info.client_certificate = mqtt.client_certificate || "";
    info.client_key_filename = mqtt.client_key_filename || "";
    info.client_key = mqtt.client_key || "";
    list.push(...(mqtt.topics || []));
  }

  if (devices?.length) {
    options.value = devices.map((item) => ({ value: item.group }));
  }

  //console.log("当前控制器数据：", controllerData);
};

watch(
  () => stepStore.getCurrentIP(),
  () => initData(),
  { immediate: true },
);

// 实时保存 MQTT 配置到 Pinia
const saveToPinia = () => {
  const currentIP = stepStore.getCurrentIP();
  const controller = controllerStore.getControllerByIp(currentIP);
  if (!controller) return;

  controller.mqtt = {
    host: info.host.trim(),
    port: info.port.trim(),
    username: info.username.trim(),
    password: info.password.trim(),
    encode_format: info.encode_format,
    last_will_topic: info.last_will_topic.trim(),
    ca_filename: info.ca_filename,
    ca_certificate: info.ca_certificate.trim(),
    client_cert_filename: info.client_cert_filename,
    client_certificate: info.client_certificate.trim(),
    client_key_filename: info.client_key_filename,
    client_key: info.client_key.trim(),
    topics: [...list],
  };
  controllerStore.addController(currentIP, controller);
};

watch(info, saveToPinia, { deep: true });

const handleUpdate = (index: number, newData: any) => {
  // 替换对应索引的项，触发响应式更新
  list[index] = { ...newData };

  saveToPinia();
};

// 处理卡片删除
const handleDelete = (index: number) => {
  list.splice(index, 1);

  saveToPinia();
};

const onAdd = () => {
  if (list.length >= 11) {
    message.warning(t("mqtt.max_limit_3"));
    return;
  }
  showModal.value = true;
};

const handleAdd = (newTopic: any) => {
  if (list.some((i) => i.group === newTopic.group)) {
    message.warning(t("mqtt.topic_repeat"));
    return;
  }

  list.push(newTopic);
  saveToPinia();
};

const onClick = () => {
  if (!info.host.trim() || !info.port.trim()) {
    message.warning(t("mqtt.host_port_required"));
    return;
  }

  handleEditCompleteJump();
};

const openFileUpload = (type: "ca" | "clientCert" | "clientKey") => {
  let domId = "";
  if (type === "ca") domId = "caCertFile";
  if (type === "clientCert") domId = "clientCertFile";
  if (type === "clientKey") domId = "clientKeyFile";

  const fileInput = document.getElementById(domId) as HTMLInputElement | null;
  fileInput?.click();
};

// 读取文件工具
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject;
  });
};

// 清空证书
const clearCert = (type: "ca" | "clientCert" | "clientKey") => {
  if (type === "ca") {
    info.ca_filename = "";
    info.ca_certificate = "";
  }
  if (type === "clientCert") {
    info.client_cert_filename = "";
    info.client_certificate = "";
  }
  if (type === "clientKey") {
    info.client_key_filename = "";
    info.client_key = "";
  }
};

// CA
const handleCaCertUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const text = await readFileContent(file);
    info.ca_filename = file.name;
    info.ca_certificate = text;
    message.success(t("mqtt.ca_upload_success"));
  } catch {
    message.error(t("mqtt.ca_upload_fail"));
  }
};

// 客户端证书
const handleClientCertUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const text = await readFileContent(file);
    info.client_cert_filename = file.name;
    info.client_certificate = text;
    message.success(t("mqtt.client_cert_upload_success"));
  } catch {
    message.error(t("mqtt.client_cert_upload_fail"));
  }
};

// 客户端密钥
const handleClientKeyUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const text = await readFileContent(file);
    info.client_key_filename = file.name;
    info.client_key = text;
    message.success(t("mqtt.client_key_upload_success"));
  } catch {
    message.error(t("mqtt.client_key_upload_fail"));
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
  position: relative;
  width: 100%;

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
    flex-shrink: 0;
  }

  &-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 60px;
    max-height: calc(100% - 60px);

    &-top {
      min-height: 56px;
      display: flex;
      align-items: center;
      gap: 36px 36px;
      margin-bottom: 36px;
      flex-shrink: 0;
      /* 👇 关键修改：自动换行 + 控制一行两个 */
      flex-wrap: wrap;
      /* 平均分配宽度，保证一行两个 */
      > * {
        flex: 0 0 calc(50% - 18px); /* 减去一半 gap，避免溢出 */
        max-width: calc(50% - 18px);
      }
    }

    &-file {
      min-height: 56px;
      display: flex;
      align-items: center;
      gap: 36px; /* 间距保持你原来的 */
      margin-bottom: 12px;
      flex-shrink: 0;
      flex-wrap: wrap; /* 自动换行 */

      /* 👇 核心：一行 3 个 */
      > * {
        flex: 0 0 calc(33.333% - 24px);
        max-width: calc(33.333% - 24px);
      }
    }

    &-block {
      display: flex;
      flex-direction: column;
    }

    &-text {
      font-weight: 400;
      font-size: 12px;
      color: var(--sider-text-color);
      line-height: 17px;
      text-align: left;
      font-style: normal;
    }

    &-row {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      margin-bottom: 8px;

      &-title {
        font-weight: bold;
        font-size: 14px;
        color: var(--header-text-color);
        line-height: 20px;
        text-align: left;
        font-style: normal;
      }
    }

    &-list {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 8px 0;
      align-content: flex-start;
    }
  }

  &-btn {
    width: 74px;
    height: 32px;
    padding: 0;
    border-radius: 0;
  }

  &-btn-add {
    width: 74px;
    height: 32px;
    padding: 0;
    border-radius: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
  }
}

.file-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .card-content-list {
    grid-template-columns: 1fr !important;
  }
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

:deep(.ant-input-password) {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--header-text-color);
  padding-left: 0;
}

:deep(.ant-input:focus, .ant-input-password:focus),
:deep(.ant-input-password:focus-within) {
  border-color: var(--header-text-color) !important;
  box-shadow: none !important;
  outline: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

:deep(.ant-select) {
  border-bottom: 1px solid var(--header-text-color);
  box-shadow: none !important;
  outline: none !important;

  .ant-select-selector {
    border: 0 !important;
    box-shadow: none !important;
    background-color: transparent !important;
    padding-left: 0;

    &:focus,
    &:hover,
    &.ant-select-selection-active {
      border-color: transparent !important;
      box-shadow: none !important;
      outline: none !important;
    }
  }
}

:deep(.ant-input-number) {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--header-text-color);
  padding-left: 0;
  background-color: transparent !important;
}

:deep(.ant-input-number:focus),
:deep(.ant-input-number-focused),
:deep(.ant-input-number:hover) {
  border-color: var(--header-text-color) !important;
  box-shadow: none !important;
  outline: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

// 去掉输入框内部的默认样式
:deep(.ant-input-number-input) {
  padding-left: 0;
  background-color: transparent !important;
}
</style>
