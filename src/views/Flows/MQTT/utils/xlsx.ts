import { message } from "ant-design-vue";
import * as XLSX from "xlsx";
import { exportToExcel } from "../../DeviceManage/utils/xlsx";
import { formatDateTimeToMinute } from "../../until/util";

const formatMessage = (key: string, params?: Record<string, any>) => {
  if (!window.$i18n) return key;
  return window.$i18n.global.t(key, params ?? {});
};

/**
 * 将 mqtt 对象展开为 Excel 行
 * 每条记录一行，topics 数组序列化为 JSON 字符串
 */
function mqttObjectToRows(mqtt: Record<string, any>): any[] {
  return Object.entries(mqtt).map(([key, record]) => {
    const row: Record<string, any> = { mqtt_key: key };
    for (const [k, v] of Object.entries(record || {})) {
      if (Array.isArray(v) || typeof v === "object") {
        row[k] = JSON.stringify(v);
      } else {
        row[k] = v ?? "";
      }
    }
    return row;
  });
}

/**
 * 将 Excel 行还原为 mqtt 对象
 */
function rowsToMqttObject(rows: any[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const row of rows) {
    const key = (row.mqtt_key ?? "").toString().trim();
    if (!key) continue;

    const record: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === "mqtt_key") continue;
      if (typeof v === "string" && v.startsWith("[") && v.endsWith("]")) {
        try {
          record[k] = JSON.parse(v);
        } catch {
          record[k] = v;
        }
      } else if (typeof v === "string" && v.startsWith("{") && v.endsWith("}")) {
        try {
          record[k] = JSON.parse(v);
        } catch {
          record[k] = v;
        }
      } else {
        record[k] = v;
      }
    }
    result[key] = record;
  }
  return result;
}

/**
 * 导出 controllerMap 中的 mqtt 对象到 Excel
 * @param mqttObj controller.mqtt 原始对象（{ mqtt1000: {...}, mqtt2000: {...} }）
 */
export function exportMqttData(mqttObj: Record<string, any>): void {
  if (!mqttObj || Object.keys(mqttObj).length === 0) {
    message.warning(formatMessage("mqtt.export_empty"));
    return;
  }

  const rows = mqttObjectToRows(mqttObj);
  const fileName = `MQTT_${formatDateTimeToMinute()}`;
  exportToExcel([{ data: rows, sheetName: "mqtt" }], fileName);
  message.success(formatMessage("mqtt.export_success"));
}

/**
 * 从 Excel 文件读取并还原 mqtt 对象
 * @param file xlsx 文件
 * @param applyData 导入成功后的回调，直接拿到还原后的 mqtt 对象
 */
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

    const sheetName = workbook.SheetNames.find((n) =>
      n.toLowerCase().includes("mqtt"),
    );
    if (!sheetName) {
      throw new Error("未找到 mqtt worksheet");
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const mqtt = rowsToMqttObject(rows);

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
