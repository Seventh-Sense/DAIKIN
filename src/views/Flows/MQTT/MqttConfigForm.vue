<template>
  <div class="card-content-inner">
    <div class="card-content-top">
      <div class="card-content-block">
        <span class="card-content-text">{{ t("mqtt.primary_host") }}</span>
        <a-input
          v-if="primaryEditing"
          v-model:value="info.host"
          style="width: 100%"
          placeholder="47.103.19.245"
        />
        <div v-else class="input-placeholder" :title="info.host || ''">
          {{ info.host || "47.103.19.245" }}
        </div>
      </div>
      <div class="card-content-block">
        <span class="card-content-text">{{ t("mqtt.primary_port") }}</span>
        <div class="input-with-action">
          <a-input
            v-if="primaryEditing"
            v-model:value="info.port"
            style="width: 100%"
            placeholder="1888"
          />
          <div v-else class="input-placeholder" :title="info.port || ''">
            {{ info.port || "1888" }}
          </div>
          <Icons
            name="edit"
            type="mono-line"
            :size="20"
            :color="{ normal: primaryEditing ? '#1677ff' : '#222222' }"
            class="action-icon"
            @click="primaryEditing = !primaryEditing"
          />
        </div>
      </div>
      <div class="card-content-block">
        <span class="card-content-text">{{ t("mqtt.secondary_host") }}</span>
        <a-input
          v-if="secondaryEditing"
          v-model:value="info.secondary_host"
          style="width: 100%"
        />
        <div v-else class="input-placeholder" :title="info.secondary_host || ''">
          {{ info.secondary_host }}
        </div>
      </div>
      <div class="card-content-block">
        <span class="card-content-text">{{ t("mqtt.secondary_port") }}</span>
        <div class="input-with-action">
          <a-input
            v-if="secondaryEditing"
            v-model:value="info.secondary_port"
            style="width: 100%"
          />
          <div v-else class="input-placeholder" :title="info.secondary_port || ''">
            {{ info.secondary_port }}
          </div>
          <Icons
            name="edit"
            type="mono-line"
            :size="20"
            :color="{ normal: secondaryEditing ? '#1677ff' : '#222222' }"
            class="action-icon"
            @click="secondaryEditing = !secondaryEditing"
          />
        </div>
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

const stepStore = useStepStore();
const controllerStore = useControllerStore();
const { t } = useI18n();

const options = ref<any[]>([]);
const showModal = ref(false);
const primaryEditing = ref(false);
const secondaryEditing = ref(false);

const info = reactive({
  host: "",
  port: "",
  secondary_host: "",
  secondary_port: "",
  encode_format: 2,
  last_will_topic: "",
  ca_filename: "",
  ca_certificate: "",
  client_cert_filename: "",
  client_certificate: "",
  client_key_filename: "",
  client_key: "",
});

const list = ref<any[]>([]);

// --- 辅助判断 ---
const hasPrimary = () => !!(info.host.trim() && info.port.trim());
const hasSecondary = () => !!(info.secondary_host.trim() && info.secondary_port.trim());

// --- 从 pinia 聚合 topics 列表（去重） ---
const aggregateList = () => {
  const ip = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(ip);
  if (!ctrl?.mqtt) {
    list.value = [];
    return;
  }
  const seen = new Set<string>();
  const result: any[] = [];
  for (const key of Object.keys(ctrl.mqtt)) {
    const topic = ctrl.mqtt[key]?.topics?.[0];
    if (topic && !seen.has(topic.group)) {
      seen.add(topic.group);
      result.push(topic);
    }
  }
  list.value = result;
};

// --- 从 pinia 表单配置回填 info ---
let prevHasPrimary = false;
let prevHasSecondary = false;

const initData = () => {
  // 重置表单
  Object.assign(info, {
    host: "", port: "", secondary_host: "", secondary_port: "",
    encode_format: 2, last_will_topic: "",
    ca_filename: "", ca_certificate: "",
    client_cert_filename: "", client_certificate: "",
    client_key_filename: "", client_key: "",
  });

  const currentIP = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(currentIP);
  if (ctrl?.mqtt) {
    // --- 旧格式兼容：存在 mqtt1（或 mqtt2）固定 key，迁移到新结构 ---
    const oldPrimary = ctrl.mqtt["mqtt1"];
    const oldSecondary = ctrl.mqtt["mqtt2"];

    if (oldPrimary || oldSecondary) {
      // 迁移旧数据到新 key（保留旧 topics 数组，按 topic 元素拆成多条）
      const topics = oldPrimary?.topics || oldSecondary?.topics || [];
      for (const topic of topics) {
        if (oldPrimary) {
          const pk = controllerStore.nextMqttPrimaryKey(currentIP);
          ctrl.mqtt[pk] = {
            host: oldPrimary.host || "",
            port: oldPrimary.port || "",
            encode_format: 2,
            last_will_topic: oldPrimary.last_will_topic || "",
            ca_filename: oldPrimary.ca_filename || "",
            ca_certificate: oldPrimary.ca_certificate || "",
            client_cert_filename: oldPrimary.client_cert_filename || "",
            client_certificate: oldPrimary.client_certificate || "",
            client_key_filename: oldPrimary.client_key_filename || "",
            client_key: oldPrimary.client_key || "",
            topics: [topic],
          };
        }
        if (oldSecondary) {
          const sk = controllerStore.nextMqttSecondaryKey(currentIP);
          ctrl.mqtt[sk] = {
            host: oldSecondary.host || "",
            port: oldSecondary.port || "",
            encode_format: 2,
            last_will_topic: oldSecondary.last_will_topic || "",
            ca_filename: oldSecondary.ca_filename || "",
            ca_certificate: oldSecondary.ca_certificate || "",
            client_cert_filename: oldSecondary.client_cert_filename || "",
            client_certificate: oldSecondary.client_certificate || "",
            client_key_filename: oldSecondary.client_key_filename || "",
            client_key: oldSecondary.client_key || "",
            topics: [topic],
          };
        }
      }
      // 同时处理 oldPrimary 里的 secondary_host/secondary_port（旧格式是主从在同一条记录）
      if (oldPrimary?.secondary_host && oldPrimary?.secondary_port) {
        // 如果没旧 mqtt2 但有 secondary 地址，也需要补建
        if (!oldSecondary) {
          for (const topic of topics) {
            const sk = controllerStore.nextMqttSecondaryKey(currentIP);
            ctrl.mqtt[sk] = {
              host: oldPrimary.secondary_host || "",
              port: oldPrimary.secondary_port || "",
              encode_format: 2,
              last_will_topic: oldPrimary.last_will_topic || "",
              ca_filename: oldPrimary.ca_filename || "",
              ca_certificate: oldPrimary.ca_certificate || "",
              client_cert_filename: oldPrimary.client_cert_filename || "",
              client_certificate: oldPrimary.client_certificate || "",
              client_key_filename: oldPrimary.client_key_filename || "",
              client_key: oldPrimary.client_key || "",
              topics: [topic],
            };
          }
        }
      }
      // 删除旧 key
      delete ctrl.mqtt["mqtt1"];
      delete ctrl.mqtt["mqtt2"];
    }

    // --- 从新结构回填表单 ---
    const newPrimaryKeys = controllerStore.getMqttKeysBySeries(currentIP, "primary");
    const newSecondaryKeys = controllerStore.getMqttKeysBySeries(currentIP, "secondary");

    if (newPrimaryKeys.length > 0) {
      const pri = ctrl.mqtt[newPrimaryKeys[0]];
      info.host = pri.host || "";
      info.port = pri.port || "";
    }
    if (newSecondaryKeys.length > 0) {
      const sec = ctrl.mqtt[newSecondaryKeys[0]];
      info.secondary_host = sec.host || "";
      info.secondary_port = sec.port || "";
    }
    // 证书从第一条记录取
    const firstKey = newPrimaryKeys[0] || newSecondaryKeys[0];
    if (firstKey) {
      const m = ctrl.mqtt[firstKey];
      info.ca_filename = m.ca_filename || "";
      info.ca_certificate = m.ca_certificate || "";
      info.client_cert_filename = m.client_cert_filename || "";
      info.client_certificate = m.client_certificate || "";
      info.client_key_filename = m.client_key_filename || "";
      info.client_key = m.client_key || "";
    }
  }

  // 聚合 topics
  aggregateList();

  // 记录当前主/从地址状态，后续检测变化
  prevHasPrimary = hasPrimary();
  prevHasSecondary = hasSecondary();

  // 填充 options（设备分组列表）
  if (ctrl?.devices?.length) {
    const allGroups = ctrl.devices.flatMap((device) => {
      if (device.group != null && device.group !== "") return [device.group];
      const firstPointGroup = device.points?.[0]?.group;
      return firstPointGroup != null ? [firstPointGroup] : [];
    }).filter((g) => g != null && g !== "");
    options.value = [...new Set(allGroups)].map((group) => ({ value: group }));
  }
};

// --- 新建 topic → 写 1-2 条 mqtt 记录 ---
const createMqttRecords = (topic: any) => {
  const ip = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(ip);
  if (!ctrl) return;
  if (!ctrl.mqtt) ctrl.mqtt = {};

  const commonConfig = {
    encode_format: 2,
    last_will_topic: info.last_will_topic.trim(),
    ca_filename: info.ca_filename,
    ca_certificate: info.ca_certificate.trim(),
    client_cert_filename: info.client_cert_filename,
    client_certificate: info.client_certificate.trim(),
    client_key_filename: info.client_key_filename,
    client_key: info.client_key.trim(),
  };

  if (hasPrimary()) {
    const key = controllerStore.nextMqttPrimaryKey(ip);
    ctrl.mqtt[key] = {
      host: info.host.trim(),
      port: info.port.trim(),
      ...commonConfig,
      topics: [topic],
    };
  }

  if (hasSecondary()) {
    const key = controllerStore.nextMqttSecondaryKey(ip);
    ctrl.mqtt[key] = {
      host: info.secondary_host.trim(),
      port: info.secondary_port.trim(),
      ...commonConfig,
      topics: [topic],
    };
  }
};

// --- 更新所有已有 mqtt 记录的公共配置字段（host/port 不改） ---
const updateAllCommonConfig = () => {
  const ip = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(ip);
  if (!ctrl?.mqtt) return;

  const commonConfig = {
    encode_format: 2,
    last_will_topic: info.last_will_topic.trim(),
    ca_filename: info.ca_filename,
    ca_certificate: info.ca_certificate.trim(),
    client_cert_filename: info.client_cert_filename,
    client_certificate: info.client_certificate.trim(),
    client_key_filename: info.client_key_filename,
    client_key: info.client_key.trim(),
  };

  for (const key of Object.keys(ctrl.mqtt)) {
    Object.assign(ctrl.mqtt[key], commonConfig);
  }
};

// --- 主/从地址变化检测：清空删除，补填补建 ---
const handleAddressChanges = () => {
  const curHasPrimary = hasPrimary();
  const curHasSecondary = hasSecondary();
  const ip = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(ip);
  if (!ctrl?.mqtt) {
    prevHasPrimary = curHasPrimary;
    prevHasSecondary = curHasSecondary;
    return;
  }

  // 主地址变空 → 删除所有主系列记录
  if (prevHasPrimary && !curHasPrimary) {
    controllerStore.deleteMqttSeries(ip, "primary");
  }

  // 从地址变空 → 删除所有从系列记录
  if (prevHasSecondary && !curHasSecondary) {
    controllerStore.deleteMqttSeries(ip, "secondary");
  }

  // 主地址从无到有 → 为所有从系列记录补建对应的主记录
  if (!prevHasPrimary && curHasPrimary) {
    const secondaryKeys = controllerStore.getMqttKeysBySeries(ip, "secondary");
    for (const secKey of secondaryKeys) {
      const topic = ctrl.mqtt[secKey]?.topics?.[0];
      if (!topic) continue;
      const primaryKey = controllerStore.nextMqttPrimaryKey(ip);
      ctrl.mqtt[primaryKey] = {
        host: info.host.trim(),
        port: info.port.trim(),
        encode_format: 2,
        last_will_topic: info.last_will_topic.trim(),
        ca_filename: info.ca_filename,
        ca_certificate: info.ca_certificate.trim(),
        client_cert_filename: info.client_cert_filename,
        client_certificate: info.client_certificate.trim(),
        client_key_filename: info.client_key_filename,
        client_key: info.client_key.trim(),
        topics: [topic],
      };
    }
  }

  // 从地址从无到有 → 为所有主系列记录补建对应的从记录
  if (!prevHasSecondary && curHasSecondary) {
    const primaryKeys = controllerStore.getMqttKeysBySeries(ip, "primary");
    for (const priKey of primaryKeys) {
      const topic = ctrl.mqtt[priKey]?.topics?.[0];
      if (!topic) continue;
      const secondaryKey = controllerStore.nextMqttSecondaryKey(ip);
      ctrl.mqtt[secondaryKey] = {
        host: info.secondary_host.trim(),
        port: info.secondary_port.trim(),
        encode_format: 2,
        last_will_topic: info.last_will_topic.trim(),
        ca_filename: info.ca_filename,
        ca_certificate: info.ca_certificate.trim(),
        client_cert_filename: info.client_cert_filename,
        client_certificate: info.client_certificate.trim(),
        client_key_filename: info.client_key_filename,
        client_key: info.client_key.trim(),
        topics: [topic],
      };
    }
  }

  prevHasPrimary = curHasPrimary;
  prevHasSecondary = curHasSecondary;
};

// --- 表单配置变化 → 更新已有记录 + 处理地址变化 ---
let prevHost = info.host;
let prevPort = info.port;
let prevSecHost = info.secondary_host;
let prevSecPort = info.secondary_port;

const onFormConfigChange = () => {
  const ip = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(ip);
  if (!ctrl?.mqtt) {
    prevHost = info.host; prevPort = info.port;
    prevSecHost = info.secondary_host; prevSecPort = info.secondary_port;
    return;
  }

  // 如果 host/port 改了（不是清空/补填）→ 更新已有主系列记录的 host/port
  if (info.host.trim() !== prevHost.trim() || info.port.trim() !== prevPort.trim()) {
    if (hasPrimary()) {
      const primaryKeys = controllerStore.getMqttKeysBySeries(ip, "primary");
      for (const key of primaryKeys) {
        ctrl.mqtt[key].host = info.host.trim();
        ctrl.mqtt[key].port = info.port.trim();
      }
    }
    prevHost = info.host;
    prevPort = info.port;
  }
  if (info.secondary_host.trim() !== prevSecHost.trim() || info.secondary_port.trim() !== prevSecPort.trim()) {
    if (hasSecondary()) {
      const secondaryKeys = controllerStore.getMqttKeysBySeries(ip, "secondary");
      for (const key of secondaryKeys) {
        ctrl.mqtt[key].host = info.secondary_host.trim();
        ctrl.mqtt[key].port = info.secondary_port.trim();
      }
    }
    prevSecHost = info.secondary_host;
    prevSecPort = info.secondary_port;
  }

  // 更新公共配置
  updateAllCommonConfig();

  // 处理地址清空/补填
  handleAddressChanges();
};

// --- init watch ---
watch(
  () => stepStore.getCurrentIP(),
  () => initData(),
  { immediate: true },
);

// --- 表单配置 watch ---
watch(
  () => [
    info.host, info.port,
    info.secondary_host, info.secondary_port,
    info.encode_format, info.last_will_topic,
    info.ca_filename, info.ca_certificate,
    info.client_cert_filename, info.client_certificate,
    info.client_key_filename, info.client_key,
  ],
  () => onFormConfigChange(),
  { deep: false },
);

// --- Topic 相关 ---
const onAdd = () => {
  if (primaryEditing.value || secondaryEditing.value) {
    message.warning(t("mqtt.editing_address_blocked"));
    return;
  }
  if (!hasPrimary() && !hasSecondary()) {
    message.warning(t("mqtt.host_port_or_secondary_required"));
    return;
  }
  if (list.value.length >= 64) {
    message.warning(t("mqtt.max_limit_3"));
    return;
  }
  showModal.value = true;
};

const handleAdd = (newTopic: any) => {
  // 去重校验
  if (list.value.some((i) => i.group === newTopic.group)) {
    message.warning(t("mqtt.topic_repeat"));
    return;
  }
  createMqttRecords(newTopic);
  aggregateList();
};

// 找到 group 匹配的所有 mqtt 记录（主+从）
const findMqttRecordsByGroup = (group: string): { keys: string[]; topics: any[] } => {
  const ip = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(ip);
  if (!ctrl?.mqtt) return { keys: [], topics: [] };
  const keys: string[] = [];
  const topics: any[] = [];
  for (const key of Object.keys(ctrl.mqtt)) {
    const topic = ctrl.mqtt[key]?.topics?.[0];
    if (topic && topic.group === group) {
      keys.push(key);
      topics.push(topic);
    }
  }
  return { keys, topics };
};

const handleUpdate = (_index: number, newData: any) => {
  const ip = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(ip);
  if (!ctrl?.mqtt) return;

  // 找到旧 group 对应的记录（用于删除后重建/更新）
  const oldRecords = findMqttRecordsByGroup(newData.group);

  if (oldRecords.keys.length === 0) {
    // 没找到旧记录 → 直接创建新的
    createMqttRecords(newData);
  } else {
    // 更新所有匹配记录的 topics[0]
    for (const key of oldRecords.keys) {
      ctrl.mqtt[key].topics = [newData];
    }
  }
  aggregateList();
};

const handleDelete = (index: number) => {
  const topic = list.value[index];
  if (!topic) return;

  const ip = stepStore.getCurrentIP();
  const ctrl = controllerStore.getControllerByIp(ip);
  if (!ctrl?.mqtt) return;

  // 删除所有 group 匹配的 mqtt 记录（主+从）
  for (const key of Object.keys(ctrl.mqtt)) {
    const t = ctrl.mqtt[key]?.topics?.[0];
    if (t && t.group === topic.group) {
      delete ctrl.mqtt[key];
    }
  }
  aggregateList();
};

// --- 文件上传 ---
const openFileUpload = (type: "ca" | "clientCert" | "clientKey") => {
  const domIdMap: Record<string, string> = {
    ca: "caCertFile",
    clientCert: "clientCertFile",
    clientKey: "clientKeyFile",
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
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
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

.input-with-action {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.action-icon {
  cursor: pointer;
  flex-shrink: 0;
}

.input-placeholder {
  width: 100%;
  height: 32px;
  padding: 4px 11px 4px 0;
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--header-text-color);
  background-color: transparent;
  color: var(--header-text-color);
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
