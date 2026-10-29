import { message } from "ant-design-vue";
import * as XLSX from "xlsx";
import { exportToExcel } from "../../DeviceManage/utils/xlsx";
import { formatDateTimeToMinute } from "../../until/util";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";

const formatMessage = (key: string, params?: Record<string, any>) => {
  if (!window.$i18n) return key;
  return window.$i18n.global.t(key, params ?? {});
};

/** 判断 mqtt key 是否属于 primary 系列（1000-1999） */
const isPrimaryKey = (key: string): boolean => {
  const n = parseInt(key.replace("mqtt", ""), 10);
  return !Number.isNaN(n) && n >= 1000 && n < 2000;
};

/** 判断 mqtt key 是否属于 secondary 系列（2000-2999） */
const isSecondaryKey = (key: string): boolean => {
  const n = parseInt(key.replace("mqtt", ""), 10);
  return !Number.isNaN(n) && n >= 2000 && n < 3000;
};

// ========== 导出辅助 ==========

type ConfigRow = {
  role: string;
  host: string;
  port: string;
  encode_format: number;
  last_will_topic: string;
  username: string;
  password: string;
  client_id: string;
};

/**
 * 从 mqttObj 提取 primary / secondary 两条基础配置行（不含证书和 topics）
 */
function extractConfigRows(mqttObj: Record<string, any>): Array<ConfigRow> {
  const rows: Array<ConfigRow> = [];
  const keys = Object.keys(mqttObj);

  // 找第一条 primary
  const firstPrimaryKey = keys.find((k) => isPrimaryKey(k));
  if (firstPrimaryKey) {
    const r = mqttObj[firstPrimaryKey];
    rows.push({
      role: "primary",
      host: r.host ?? "",
      port: r.port ?? "",
      encode_format: r.encode_format ?? 2,
      last_will_topic: r.last_will_topic ?? "",
      username: r.username ?? "",
      password: r.password ?? "",
      client_id: r.client_id ?? "",
    });
  }

  // 找第一条 secondary
  const firstSecondaryKey = keys.find((k) => isSecondaryKey(k));
  if (firstSecondaryKey) {
    const r = mqttObj[firstSecondaryKey];
    rows.push({
      role: "secondary",
      host: r.host ?? "",
      port: r.port ?? "",
      encode_format: r.encode_format ?? 2,
      last_will_topic: r.last_will_topic ?? "",
      username: r.username ?? "",
      password: r.password ?? "",
      client_id: r.client_id ?? "",
    });
  }

  return rows;
}

/**
 * 从 mqttObj 提取去重后的 topic 行（sn / pkey 来自 topic，product_secret 来自记录外层 password）
 */
function extractTopicRows(
  mqttObj: Record<string, any>,
): Array<{ group: any; sub_topic: any; pub_topic: any; interval: any; sn: string; pkey: string; product_secret: string }> {
  const seen = new Set<string>();
  const rows: Array<{ group: any; sub_topic: any; pub_topic: any; interval: any; sn: string; pkey: string; product_secret: string }> = [];

  for (const key of Object.keys(mqttObj)) {
    const record = mqttObj[key];
    const topic = record?.topics?.[0];
    if (!topic) continue;
    if (seen.has(topic.group)) continue;
    seen.add(topic.group);

    rows.push({
      group: topic.group ?? "",
      sub_topic: topic.sub_topic ?? "",
      pub_topic: topic.pub_topic ?? "",
      interval: topic.interval ?? 1,
      sn: topic.sn ?? "",
      pkey: topic.pkey ?? "",
      product_secret: record.password ?? "",
    });
  }

  return rows;
}

// ========== 导入辅助 ==========

/**
 * 从 Excel topic 行还原 topic 对象及对应的外层认证字段
 */
function rebuildTopicFromRow(row: any, fallbackPassword = "") {
  const sn = (row.sn ?? "").toString().trim();
  const pkey = (row.pkey ?? "").toString().trim();
  const product_secret = (row.product_secret ?? "").toString().trim();
  return {
    topicCore: {
      group: row.group ?? "",
      sub_topic: row.sub_topic ?? "",
      pub_topic: row.pub_topic ?? "",
      interval: row.interval ?? 1,
      sn,
      pkey,
    },
    username: `${pkey}&${sn}`,
    password: product_secret || fallbackPassword,
    client_id: `${sn}&v1`,
  };
}

/**
 * 从 mqtt_config / topics 两 sheet 数据重建完整 mqttObj
 */
function rebuildMqttObject(
  configRows: Array<ConfigRow>,
  topicRows: any[],
): Record<string, any> {
  const controllerStore = useControllerStore();
  const stepStore = useStepStore();
  const currentIP = stepStore.getCurrentIP();

  const result: Record<string, any> = {};

  const hasPrimary = configRows.some(
    (c) => c.role === "primary" && (c.host ?? "").toString().trim() !== "" && (c.port ?? "").toString().trim() !== "",
  );
  const hasSecondary = configRows.some(
    (c) => c.role === "secondary" && (c.host ?? "").toString().trim() !== "" && (c.port ?? "").toString().trim() !== "",
  );

  if (!hasPrimary && !hasSecondary) {
    message.warning(formatMessage("mqtt.host_port_required"));
    return result;
  }

  const primaryConfig = configRows.find((c) => c.role === "primary");
  const secondaryConfig = configRows.find((c) => c.role === "secondary");

  for (const row of topicRows) {
    const { topicCore, username, password, client_id } = rebuildTopicFromRow(
      row,
      (primaryConfig?.password ?? secondaryConfig?.password ?? "").toString(),
    );

    if (hasPrimary && primaryConfig) {
      const key = controllerStore.nextMqttPrimaryKey(currentIP);
      result[key] = {
        host: (primaryConfig.host ?? "").toString().trim(),
        port: (primaryConfig.port ?? "").toString().trim(),
        username,
        password,
        client_id,
        encode_format: primaryConfig.encode_format ?? 2,
        last_will_topic: primaryConfig.last_will_topic ?? "",
        ca_filename: "",
        ca_certificate: "",
        client_cert_filename: "",
        client_certificate: "",
        client_key_filename: "",
        client_key: "",
        topics: [topicCore],
      };
    }

    if (hasSecondary && secondaryConfig) {
      const key = controllerStore.nextMqttSecondaryKey(currentIP);
      result[key] = {
        host: (secondaryConfig.host ?? "").toString().trim(),
        port: (secondaryConfig.port ?? "").toString().trim(),
        username,
        password,
        client_id,
        encode_format: secondaryConfig.encode_format ?? 2,
        last_will_topic: secondaryConfig.last_will_topic ?? "",
        ca_filename: "",
        ca_certificate: "",
        client_cert_filename: "",
        client_certificate: "",
        client_key_filename: "",
        client_key: "",
        topics: [topicCore],
      };
    }
  }

  return result;
}

// ========== 导出入口 ==========

export function exportMqttData(mqttObj: Record<string, any>): void {
  if (!mqttObj || Object.keys(mqttObj).length === 0) {
    message.warning(formatMessage("mqtt.export_empty"));
    return;
  }

  const configRows = extractConfigRows(mqttObj);
  const topicRows = extractTopicRows(mqttObj);

  const fileName = `MQTT_${formatDateTimeToMinute()}`;
  exportToExcel<any>(
    [
      { data: configRows, sheetName: "mqtt_config" },
      { data: topicRows, sheetName: "topics" },
    ],
    fileName,
  );
  message.success(formatMessage("mqtt.export_success"));
}

// ========== 导入入口 ==========

export async function importMqttData(
  file: File,
  applyData: (mqtt: Record<string, any>) => void,
): Promise<void> {
  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    message.warning(formatMessage("mqtt.excelSelectTip"));
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    const configSheet = workbook.SheetNames.find((n) => n.toLowerCase() === "mqtt_config");
    const topicsSheet = workbook.SheetNames.find((n) => n.toLowerCase() === "topics");

    if (!configSheet || !topicsSheet) {
      throw new Error("未找到 mqtt_config / topics worksheet，请使用最新版本的导出格式");
    }

    const configRows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[configSheet], { defval: "" });
    const topicRows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[topicsSheet], { defval: "" });

    const mqtt = rebuildMqttObject(configRows as any, topicRows as any);

    if (Object.keys(mqtt).length === 0) {
      message.warning(formatMessage("mqtt.export_empty"));
      return;
    }

    applyData(mqtt);
    message.success(formatMessage("mqtt.import_success"));
  } catch (error) {
    console.error("MQTT 导入失败:", error);
    message.error(formatMessage("mqtt.import_failed"));
    throw error;
  }
}
