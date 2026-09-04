<template>
  <div class="card-content-inner">
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
          :id="'caCertFile_' + mqttKey"
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
          :id="'clientCertFile_' + mqttKey"
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
          :id="'clientKeyFile_' + mqttKey"
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
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import Icons from "@/icons/index.vue";
import TopicCard from "./TopicCard/index.vue";
import TopicModal from "./TopicModal/index.vue";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";

const props = defineProps<{
  mqttKey: "mqtt1" | "mqtt2";
}>();

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

const defaultInfo = () => ({
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

const resetInfo = () => {
  Object.assign(info, defaultInfo());
  list.length = 0;
};

const initData = () => {
  resetInfo();

  const currentIP = stepStore.getCurrentIP();
  const controllerData = controllerStore.getControllerByIp(currentIP);

  if (!controllerData) return;

  const mqttData = controllerData.mqtt?.[props.mqttKey];

  if (mqttData) {
    info.host = mqttData.host || "";
    info.port = mqttData.port || "";
    info.username = mqttData.username || "";
    info.password = mqttData.password || "";
    info.encode_format = Number(mqttData.encode_format) || 1;
    info.last_will_topic = mqttData.last_will_topic || "";
    info.ca_filename = mqttData.ca_filename || "";
    info.ca_certificate = mqttData.ca_certificate || "";
    info.client_cert_filename = mqttData.client_cert_filename || "";
    info.client_certificate = mqttData.client_certificate || "";
    info.client_key_filename = mqttData.client_key_filename || "";
    info.client_key = mqttData.client_key || "";
    list.push(...(mqttData.topics || []));
  }

  const { devices } = controllerData;
  if (devices?.length) {
    options.value = [...new Set(devices.map((item) => item.group))].map(
      (group) => ({ value: group }),
    );
  }
};

watch(
  () => stepStore.getCurrentIP(),
  () => initData(),
  { immediate: true },
);

const saveToPinia = () => {
  const currentIP = stepStore.getCurrentIP();
  const controller = controllerStore.getControllerByIp(currentIP);
  if (!controller) return;

  if (!controller.mqtt) {
    controller.mqtt = {};
  }
  controller.mqtt[props.mqttKey] = {
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
  list[index] = { ...newData };
  saveToPinia();
};

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

const openFileUpload = (type: "ca" | "clientCert" | "clientKey") => {
  const domIdMap: Record<string, string> = {
    ca: `caCertFile_${props.mqttKey}`,
    clientCert: `clientCertFile_${props.mqttKey}`,
    clientKey: `clientKeyFile_${props.mqttKey}`,
  };
  const fileInput = document.getElementById(domIdMap[type]) as HTMLInputElement | null;
  fileInput?.click();
};

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject;
  });
};

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

// 暴露给父组件的校验方法
const validate = () => {
  if (!info.host.trim() || !info.port.trim()) {
    message.warning(t("mqtt.host_port_required"));
    return false;
  }
  return true;
};

defineExpose({ validate });
</script>

<style lang="less" scoped>
.card-content-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-content-top {
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 36px 36px;
  margin-bottom: 36px;
  flex-shrink: 0;
  flex-wrap: wrap;

  > * {
    flex: 0 0 calc(50% - 18px);
    max-width: calc(50% - 18px);
  }
}

.card-content-file {
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 36px;
  margin-bottom: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;

  > * {
    flex: 0 0 calc(33.333% - 24px);
    max-width: calc(33.333% - 24px);
  }
}

.card-content-block {
  display: flex;
  flex-direction: column;
}

.card-content-text {
  font-weight: 400;
  font-size: 12px;
  color: var(--sider-text-color);
  line-height: 17px;
  text-align: left;
  font-style: normal;
}

.card-content-row {
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

.card-content-list {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 8px 0;
  align-content: flex-start;
}

.card-btn-add {
  width: 74px;
  height: 32px;
  padding: 0;
  border-radius: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
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
</style>
