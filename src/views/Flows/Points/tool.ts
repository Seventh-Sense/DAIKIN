import { DeviceTypeEnum } from "../DeviceManage/utils/options";
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
