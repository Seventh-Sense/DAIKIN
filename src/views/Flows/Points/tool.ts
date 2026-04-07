import {
  AlignmentOption,
  BooleanOption,
  DatatypeOptions,
  DeviceTypeEnum,
  functionOptions,
  OrderOptions,
  WritableOption,
} from "../DeviceManage/utils/options";
import { getDeviceTypeName, TypeEnum } from "../DeviceManage/utils/utils";

export const transformSubscribePointsData = (
  rawData: any[],
  deviceId: string | number,
): any[] => {
  return rawData.map((item: any) => ({
    key: item.id,
    metric_uid: item.uid,
    metric_id: item.uid.includes(",") ? item.uid.split(",")[1] : item.uid,
    metric_type: item.uid.includes(",")
      ? getDeviceTypeName(parseInt(item.uid.split(",")[0]))
      : "",
    metric_name: item.name || "",
    unit: "",
    value: "",
    description: item.description || "",
    status: "",
    properties: item.property || {},
    tags: item.tags || [],
    timestamp: "",
    device_id: deviceId,
  }));
};

export function formatTimestamp(timestamp: any) {
  // 将时间戳转为毫秒并创建Date对象
  const date = new Date(timestamp * 1000);

  // 提取时间组成部分
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // 组合成标准格式
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const getProcessedValue = (
  point: any,
  metricType: any,
  deviceType: any,
) => {
  if (deviceType === DeviceTypeEnum.BACnet) {
    const type = metricType;

    switch (type) {
      case TypeEnum.BI:
      case TypeEnum.BV:
      case TypeEnum.BO: {
        const status = point.value === 0 ? "inactive-text" : "active-text";

        if (
          !point.property?.[status] ||
          point.property?.[status] === "unknown-property"
        ) {
          return point.value;
        } else {
          return point.property?.[status];
        }
      }

      case TypeEnum.MV: {
        const states = point.property?.["state-text"] || [];
        const index = point.value - 1;

        if (index >= 0 && index < states.length) {
          return states[index];
        }

        return point.value;
      }

      default:
        return point.value?.toString() ?? "";
    }
  } else {
    return point.value?.toString() ?? "";
  }
};

export const mergeProperties = (newProps: any, fallback: any) => {
  return newProps && Object.keys(newProps).length > 0 ? newProps : fallback;
};

const MODBUS_TEXT_MAPPER: Record<string, any[]> = {
  function: functionOptions,
  byteorder: OrderOptions,
  wordorder: OrderOptions,
  data_type: DatatypeOptions,
  writable: BooleanOption,
  align_format: AlignmentOption,
};

const getLabelByValue = (value: any, options: any[]) => {
  const option = options.find((opt) => opt.value === value);
  return option?.label || value; // 严格遵循找不到返回空字符串
};

export const modbusSelectOptions = (key: any) => {
  return MODBUS_TEXT_MAPPER[key] ? MODBUS_TEXT_MAPPER[key] : [];
};

export const modbusSelectTextMap = (key: any, value: any) => {
  if (MODBUS_TEXT_MAPPER[key]) {
    return getLabelByValue(value, MODBUS_TEXT_MAPPER[key]);
  }
  return String(value);
};

/**
 * 校验输入字符串是否为有效的非负整数（0-255）或整数范围（0-255）
 * @param value 输入字符串
 * @returns 校验结果 (true: 有效, false: 无效)
 */
export const validateIntegerOrRange = (value: string): boolean => {
  // 移除字符串两端空格
  const trimmedValue = value.trim()

  // 情况1：单个整数校验（必须 ≥0 且 ≤65535 的整数）
  if (!trimmedValue.includes('-')) {
    // 使用正则验证整数格式
    if (!/^\d+$/.test(trimmedValue)) return false
    const num = parseInt(trimmedValue, 10)
    return num >= 0 && num <= 65535
  }

  // 情况2：范围格式校验（必须满足 X-Y 格式）
  const parts = trimmedValue.split('-')
  if (parts.length !== 2) return false

  const [startStr, endStr] = parts.map(s => s.trim())

  // 验证两个部分都是整数
  if (!/^\d+$/.test(startStr) || !/^\d+$/.test(endStr)) return false

  const start = parseInt(startStr, 10)
  const end = parseInt(endStr, 10)

  // 范围值校验（必须满足 0≤start≤end≤65535）
  return start >= 0 && end >= 0 && start <= end && end <= 65535
}