import JSZip from "jszip";
import { DeviceTypeEnum } from "../DeviceManage/utils/options";

export const controllerFileName = "objConfig/objConfig.zip";

export const generateConfigZipFile = async (data: any): Promise<File> => {
  const jsonStr = JSON.stringify(data, null, 2);
  const zip = new JSZip();
  zip.file("objConfig.json", jsonStr);

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return new File([zipBlob], "objConfig.zip", { type: "application/zip" });
};

export const unzipAndReadConfig = async (zipData: {
  filename: string;
  file_size: number;
  data: string;
}): Promise<any> => {
  const zip = new JSZip();

  // 关键：加载 base64 格式的 zip 数据
  await zip.loadAsync(zipData.data, { base64: true });

  // 读取固定文件名 objConfig.json
  const jsonFile = zip.files["objConfig.json"];
  if (!jsonFile) {
    throw new Error("压缩包内未找到 objConfig.json");
  }

  // 转字符串并解析 JSON
  const jsonStr = await jsonFile.async("string");
  return JSON.parse(jsonStr);
};

export const isDataEqual = (obj1: any, obj2: any): boolean => {
  // 简单场景可用JSON.stringify，复杂场景建议用lodash的isEqual
  try {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  } catch (error) {
    console.error("数据对比失败", error);
    return false;
  }
};

export const getAllPointsInfo = (localData: any) => {
  if (!localData || !Array.isArray(localData.devices)) {
    return [];
  }

  const result: any[] = [];

  localData.devices.forEach((device: any) => {
    if (!Array.isArray(device.points)) {
      return;
    }

    device.points.forEach((point: any) => {
      result.push({
        device_name: device.device_name,
        device_uid: device.uid,
        device_type: device.device_type,
        point_name: point.point_name,
        point_uid: point.uid,
        data_type:
          device.device_type === "BACnet"
            ? point.property.object_type
            : point.property.data_type,
        min: point.property.min,
        max: point.property.max,
      });
    });
  });

  return result;
};

export const resetCheckStatus = (item: any) => {
  item.total = 0;
  item.failed = 0;
  item.percent = 0;
};

export const getPointType = (device_type: string, data_type: string) => {
  let type = "analog";

  console.log("device_type  data_type", device_type, data_type);
  if (device_type === DeviceTypeEnum.BACnet) {
    if (
      data_type === "binary-input" ||
      data_type === "binary-output" ||
      data_type === "binary-value"
    ) {
      type = "binary";
    } else if (
      data_type === "multi-state-input" ||
      data_type === "multi-state-output" ||
      data_type === "multi-state-value"
    ) {
      type = "multi-state";
    } else {
      type = "analog";
    }
  } else if (device_type === DeviceTypeEnum.ModbusTCP) {
    if (data_type === "bool" || data_type === "boolean") {
      type = "binary";
    } else {
      type = "analog";
    }
  } else if (device_type === DeviceTypeEnum.KNX) {
    if (
      data_type === "switch" ||
      data_type === "binary" ||
      data_type === "bool" ||
      data_type === "boolean"
    ) {
      type = "binary";
    } else if (data_type === "multiState") {
      type = "multiState";
    } else {
      type = "analog";
    }
  }

  return type;
};
