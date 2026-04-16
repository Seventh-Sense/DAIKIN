import { message } from "ant-design-vue";
import {
  ControllerTypeEnum,
  TypeOptions,
  DeviceTypeEnum,
  DataType,
} from "./options";
import { formatDateTimeToMinute, validateIPv4 } from "../../until/util";
import { PropertyConstants } from "./propertyID";
import unitsJson from "./Units.json";
import { generateTimeUniqueId } from "@/utils/function";
import { exportToExcel } from "./xlsx";

const formatMessage = (key: string, params?: Record<string, any>) => {
  // 安全校验：确保i18n实例存在
  if (!window.$i18n) {
    console.warn("i18n instance is not initialized");
    return key; // 回退返回原始key
  }

  // 使用global.t方法进行翻译
  return window.$i18n.global.t(key);
};

export const getDeviceTypeLabel = (value: any) => {
  const matchedOption = TypeOptions.find((option) => option.value === value);
  return matchedOption ? matchedOption.label : value;
};

//判断当前控制器类型
export const getControllerType = (key: string) => {
  const typeMap = [
    { prefix: "1-", type: ControllerTypeEnum.Pro },
    { prefix: "2-", type: ControllerTypeEnum.Standard },
    { prefix: "3-", type: ControllerTypeEnum.Lite },
  ];

  const matched = typeMap.find((item) => key.startsWith(item.prefix));
  return matched ? matched.type : ControllerTypeEnum.Pro;
};

//根据控制器类型，支持不同的协议
export const getOptions = (type: any) => {
  // Pro: 显示所有选项
  if (type === ControllerTypeEnum.Pro) {
    return [...TypeOptions];
  }
  // Standard: 排除KNX
  else if (type === ControllerTypeEnum.Standard) {
    return TypeOptions.filter((item) => item.value !== DeviceTypeEnum.KNX);
  }
  // Lite: 排除KNX和ModbusTCP
  else if (type === ControllerTypeEnum.Lite) {
    return TypeOptions.filter(
      (item) =>
        item.value !== DeviceTypeEnum.KNX &&
        item.value !== DeviceTypeEnum.ModbusTCP,
    );
  }

  // 默认返回所有选项
  return [...TypeOptions];
};

// 数据校验
export const deviceDataCheck = (deviceData: DataType): boolean => {
  console.log("Validating device data:", deviceData);
  switch (deviceData.type) {
    case DeviceTypeEnum.ModbusTCP:
      return validateModbusTCP(deviceData);
    case DeviceTypeEnum.KNX:
      return validateKNX(deviceData);
    default:
      return false;
  }
};

const validateModbusTCP = (data: DataType): boolean => {
  if (!data.name || !data.property.host || data.property.port === null) {
    message.warn(formatMessage("device_manage.emptyField"));
    return true;
  }

  if (!validateIPv4(data.property.host)) {
    message.warn(formatMessage("device_manage.invalidIp"));
    return true;
  }

  return false;
};

const validateKNX = (data: DataType): boolean => {
  if (!data.name || data.property.gateway_port === null) {
    message.warn(formatMessage("device_manage.emptyField"));
    return true;
  }

  if (!validateIPv4(data.property.gateway_ip)) {
    message.warn(formatMessage("device_manage.invalidIp"));
    return true;
  }

  return false;
};

// 参数创建函数
export const createModbusTCPParams = (data: DataType) => ({
  uid: data.id || generateTimeUniqueId(),
  device_name: data.name,
  device_type: DeviceTypeEnum.ModbusTCP,
  device_sn: data.property.sn,
  device_dev: data.property.dev,
  polling: data.polling,
  address: data.property.host + ":" + data.property.port,
  description: data.property.desc,
  enabled: data.enabled === 1,
  property: {
    slaveid: data.property.slaveid,
    host: data.property.host,
    port: data.property.port,
    timeout: 3,
  },
  points: [],
});

export const createKNXParams = (data: DataType) => ({
  uid: data.id || generateTimeUniqueId(),
  device_name: data.name,
  device_type: DeviceTypeEnum.KNX,
  device_sn: data.property.sn,
  device_dev: data.property.dev,
  polling: data.polling,
  address: data.property.gateway_ip + ":" + data.property.gateway_port,
  description: data.property.desc,
  enabled: data.enabled === 1,
  property: {
    local_ip: data.property.local_ip,
    gateway_ip: data.property.gateway_ip,
    gateway_port: data.property.gateway_port,
  },
  points: [],
});

export const ModbusTCPData = {
  slaveid: "1",
  host: "127.0.0.1",
  port: 5020,
  connectionOption: "tcp",
  sn: "",
  dev: "",
  desc: "",
};

export const KNXData = {
  local_ip: "127.0.0.1",
  gateway_ip: "127.0.0.255",
  gateway_port: 3671,
  sn: "",
  dev: "",
  desc: "",
};

/**
 * 转换单个设备项的格式
 * 职责：统一处理设备字段的映射、默认值、类型保证
 * @param {any} item - 原始设备数据项
 * @param {number} index - 数组索引
 * @returns {object} 格式化后的设备项
 */
export const transformDeviceItem = (item: any, index: number) => {
  return {
    key: item.id, // 保持 number 类型
    device_id: item.uid || "",
    device_name: item.name || "",
    device_type: item.protocol || "",
    polling: 3, // 确保数字类型
    address: item.address || "",
    status: item.status || "",
    enabled: item.enabled, // 确保数字类型
    properties: item.property || {},
    tags: item.tags || "",
    description: item.description || "",
  };
};

//解析属性数据， [[8, 57], 75, null, [8, 57]]

// 提取常量键名作为联合类型，约束类型安全
type PropertyKey = keyof typeof PropertyConstants;
// 提取常量值（数字标识）作为联合类型
type PropertyValue = (typeof PropertyConstants)[PropertyKey];

interface DeviceRawItem {
  0: [number, number]; // 设备分组标识 [8,57]
  1: PropertyValue; // 数字属性标识（75/77/79等）
  2: null; // 固定为null
  3: any; // 属性值
}

interface DeviceTransformed {
  [key: string]: any;
}

export const PropertyMap = Object.freeze({
  /**
   * 根据数字标识反向查找对应的属性名
   * @param value 数字属性标识（如75/77）
   * @returns 驼峰属性名 | undefined
   */
  getPropertyName(value: number): PropertyKey | undefined {
    // 遍历常量键值对，找到值匹配的键名
    return (
      Object.entries(PropertyConstants) as [PropertyKey, PropertyValue][]
    ).find(([_, val]) => val === value)?.[0];
  },
});

//驼峰转短横线
const camelToKebab = (camelCaseString: string) => {
  if (!camelCaseString) return camelCaseString;

  return camelCaseString
    .split(/(?=[A-Z])/)
    .join("-")
    .toLowerCase();
};

export const transformDeviceData = (
  rawData: DeviceRawItem[],
): DeviceTransformed => {
  const transformedData: DeviceTransformed = {};

  // 遍历原始数据，逐行处理
  rawData.forEach((item) => {
    // 提取数字标识和属性值
    const propertyId = item[1];
    const propertyValue = item[3];

    // 步骤1：根据数字标识获取驼峰属性名
    const camelCaseName = PropertyMap.getPropertyName(propertyId);
    if (!camelCaseName) return; // 无匹配属性名，跳过

    // 步骤2：驼峰转短横线命名
    const kebabCaseName = camelToKebab(camelCaseName);

    // 步骤3：存入结果对象
    transformedData[kebabCaseName] = propertyValue;
  });

  return transformedData;
};

export enum TypeEnum {
  AI = "Analog Input",
  AO = "Analog Output",
  AV = "Analog Value",
  BI = "Binary Input",
  BO = "Binary Output",
  BV = "Binary Value",
  MV = "Multi-state Value",
  Calendar = "Calendar",
  Device = "Device",
  MI = "Multi-state Input",
  MO = "Multi-state Output",
  Notification = "Notification",
  Schedule = "Schedule",
  TrendLog = "Trend Log",
  NetworkPort = "Network Port",
  Accumulator = "Accumulator",
}

export const DEVICE_TYPE_MAP: { [key: number]: string } = {
  0: TypeEnum.AI,
  1: TypeEnum.AO,
  2: TypeEnum.AV,
  3: TypeEnum.BI,
  4: TypeEnum.BO,
  5: TypeEnum.BV,
  6: TypeEnum.Calendar,
  8: TypeEnum.Device,
  13: TypeEnum.MI,
  14: TypeEnum.MO,
  15: TypeEnum.Notification,
  17: TypeEnum.Schedule,
  19: TypeEnum.MV,
  20: TypeEnum.TrendLog,
  23: TypeEnum.Accumulator,
  56: TypeEnum.NetworkPort,
};

export const getDeviceTypeName = (key: number): string => {
  return DEVICE_TYPE_MAP[key] ?? String(key);
};

export const getDeviceTypeId = (typeStr: string): number | string => {
  // 创建反向映射表 { 字符串值: 数字ID }
  const reverseMap: Record<string, number> = {};

  // 构建反向映射
  (Object.entries(DEVICE_TYPE_MAP) as [string, TypeEnum][]).forEach(
    ([key, value]) => {
      reverseMap[value] = parseInt(key, 10);
    },
  );

  // 查找并返回结果
  return reverseMap[typeStr] ?? typeStr;
};

export const objIDTrans = (value: Array<number>) => {
  let text = "";

  if (value.length === 2) {
    text = getDeviceTypeName(value[0]) + "," + value[1];
  }
  return text;
};

export const unitsTrans = (value: any) => {
  let text = "";

  Object.entries(unitsJson).forEach(([key, val]) => {
    if (parseInt(key) === value) {
      text = val;
    }
  });

  //console.log('unitsTrans', value, text)

  return text;
};

export const presentValueTrans = (
  value: any,
  type: string,
  BinaryOption: any,
  MVOption: any,
) => {
  let text = value;

  //console.log('presentValueTrans', value, type, BinaryOption, MVOption)

  if (type === TypeEnum.AI || type === TypeEnum.AV || type === TypeEnum.AO) {
    text = value;
  } else if (
    type === TypeEnum.BI ||
    type === TypeEnum.BV ||
    type === TypeEnum.BO
  ) {
    if (BinaryOption.length === 2) {
      BinaryOption.forEach((item: any) => {
        if (item.value === value) {
          text = item.label;
        }
      });
    } else {
      text = value;
    }
  } else if (type === TypeEnum.MV) {
    if (MVOption.length > 0) {
      MVOption.forEach((item: any) => {
        if (item.value === value) {
          text = item.label;
        }
      });
    } else {
      text = value;
    }
  }

  return text;
};

export const isPriority = (type: string) => {
  let flag = false;

  if (
    type === TypeEnum.MV ||
    type === TypeEnum.BV ||
    type === TypeEnum.BO ||
    type === TypeEnum.AV ||
    type === TypeEnum.AO
  ) {
    flag = true;
  }

  return flag;
};

// ====================== 【外部配置区】
const BASE_FILE_NAME = "设备点位列表";

const DEVICE_PRO_MAP = {
  BACnet: "bacnet",
  KNX: "knx",
  ModbusTCP: "modbus_tcp",
};

const SHEET_CONFIGS = Object.values(DEVICE_PRO_MAP).flatMap((key) => [
  { sheetName: `${key}_devices` },
  { sheetName: `${key}_points` },
]);

// ===================== 你的原有配置（完全不动） =====================
const DEVICE_FIELD_CONFIG = {
  BACnet: (device: any) => ({
    uid: device.uid,
    device_name: device.device_name,
    device_protocol: device.device_type,
    device_sn: device.device_sn,
    device_dev: device.device_dev,
    polling: device.polling,
    description: device.description,
    enabled: device.enabled,
    address: device.address,
    device_id: device.property?.device_id,
    vendor_name: device.property?.vendor_name,
    vendor_id: device.property?.vendor_id,
    model_name: device.property?.model_name,
    max_apdu_length: device.property?.max_apdu_length,
    segmentation_supported: device.property?.segmentation_supported,
  }),
  KNX: (device: any) => ({
    uid: device.uid,
    device_name: device.device_name,
    device_protocol: device.device_type,
    device_sn: device.device_sn,
    device_dev: device.device_dev,
    polling: device.polling,
    description: device.description,
    enabled: device.enabled,
    loacl_ip: device.property?.local_ip,
    gateway_ip: device.property?.gateway_ip,
    gateway_port: device.property?.gateway_port,
  }),
  ModbusTCP: (device: any) => ({
    uid: device.uid,
    device_name: device.device_name,
    device_protocol: device.device_type,
    device_sn: device.device_sn,
    device_dev: device.device_dev,
    polling: device.polling,
    description: device.description,
    enabled: device.enabled,
    host: device.property?.host,
    port: device.property?.port,
    slaveid: device.property?.slaveid,
  }),
};

const POINT_FIELD_CONFIG = {
  BACnet: (device: any, point: any) => ({
    uid: point.uid,
    device_name: device.device_name,
    device_dev: device.device_dev,
    point_name: point.point_name,
    point_m: point.point_m,
    pkey: point.description,
    writable: point.writable,
    object_type: point.property?.object_type,
    object_instance: point.property?.object_instance,
    min: point.property?.min,
    max: point.property?.max,
  }),
  KNX: (device: any, point: any) => ({
    uid: point.uid,
    device_name: device.device_name,
    device_dev: device.device_dev,
    point_name: point.point_name,
    point_m: point.point_m,
    pkey: point.description,
    writable: point.writable,
    status_address: point.property?.read_address,
    control_address: point.property?.write_address,
    data_type: point.property?.data_type,
    min: point.property?.min,
    max: point.property?.max,
  }),
  ModbusTCP: (device: any, point: any) => ({
    uid: point.uid,
    device_name: device.device_name,
    device_dev: device.device_dev,
    point_name: point.point_name,
    point_m: point.point_m,
    pkey: point.description,
    writable: point.writable,
    register_address: point.property?.address,
    align_format: point.property?.align_format,
    register_count: point.property?.count,
    data_type: point.property?.data_type,
    register_type: point.property?.function,
    offset: point.property?.offset,
    scale: point.property?.scale,
    unit: point.property?.unit,
    min: point.property?.min,
    max: point.property?.max,
  }),
};

/**
 * 自动根据 FIELD_CONFIG 生成空行：所有字段值为空字符串
 */
const createEmptyRow = (fn: (...args: any[]) => Record<string, any>) => {
  // 调用函数，传入空对象占位，拿到所有返回的字段名
  const fields = fn({}, {});
  // 把所有值变成空字符串
  return Object.keys(fields).reduce(
    (acc, key) => {
      acc[key] = "";
      return acc;
    },
    {} as Record<string, string>,
  );
};

/**
 * 自动生成所有空表结构：完全替代 EMPTY_TABLE_HEADERS
 */
const AUTO_EMPTY_TABLES = Object.entries(DEVICE_PRO_MAP).reduce(
  (acc, [type, prefix]) => {
    // 设备空表
    acc[`${prefix}_devices`] = [
      createEmptyRow(
        DEVICE_FIELD_CONFIG[type as keyof typeof DEVICE_FIELD_CONFIG],
      ),
    ];
    // 点位空表
    acc[`${prefix}_points`] = [
      createEmptyRow(
        POINT_FIELD_CONFIG[type as keyof typeof POINT_FIELD_CONFIG],
      ),
    ];
    return acc;
  },
  {} as Record<string, Record<string, string>[]>,
);

export const exportDataTrans = (deviceList: any[]) => {
  const data = SHEET_CONFIGS.reduce((acc: any, cur) => {
    acc[cur.sheetName] = [];
    return acc;
  }, {});

  deviceList.forEach((device: any) => {
    const type = device.device_type;
    const key = DEVICE_PRO_MAP[type as keyof typeof DEVICE_PRO_MAP];
    if (!key) return;

    // 处理设备
    const deviceFields =
      DEVICE_FIELD_CONFIG[type as keyof typeof DEVICE_FIELD_CONFIG]?.(device);
    if (deviceFields) data[`${key}_devices`].push(deviceFields);

    // 处理点位
    device.points?.forEach((point: any) => {
      const pointFields = POINT_FIELD_CONFIG[
        type as keyof typeof POINT_FIELD_CONFIG
      ]?.(device, point);
      if (pointFields) data[`${key}_points`].push(pointFields);
    });
  });

  // 填充空表：直接用自动生成的，无需手写
  Object.keys(data).forEach((key) => {
    if (data[key].length === 0) {
      data[key] = AUTO_EMPTY_TABLES[key];
    }
  });

  const excelSheets = SHEET_CONFIGS.map((cfg) => ({
    data: data[cfg.sheetName],
    sheetName: cfg.sheetName,
  }));

  const exportFileName = `${BASE_FILE_NAME}_${formatDateTimeToMinute()}`;
  exportToExcel(excelSheets, exportFileName);
};

export const importFileTrans = (sheets: any[]) => {
  const sheetMap: Record<string, any[]> = {};

  sheets.forEach((sheet) => {
    if (sheet.name && Array.isArray(sheet.data)) {
      sheetMap[sheet.name] = sheet.data;
    }
  });

  console.log("sheets:", sheetMap);
  const deviceMap = new Map<string, any>();

  Object.entries(DEVICE_PRO_MAP).forEach(([protocol, prefix]) => {
    const deviceSheetName = `${prefix}_devices`;
    const deviceRows = sheetMap[deviceSheetName] || [];

    deviceRows.forEach((row) => {
      // 过滤无效空行
      if (!row.device_name?.trim() && !row.device_sn?.trim()) return;

      const device = transformDeviceRow(row, protocol);
      const uniqueKey = `${device.device_name}_${device.device_dev}`;
      deviceMap.set(uniqueKey, device);
    });
  });

  Object.entries(DEVICE_PRO_MAP).forEach(([protocol, prefix]) => {
    const pointSheetName = `${prefix}_points`;
    const pointRows = sheetMap[pointSheetName] || [];

    pointRows.forEach((row) => {
      // 过滤无效空行
      if (!row.device_name?.trim() && !row.point_name?.trim()) return;

      const point = transformPointRow(row, protocol);
      const deviceUniqueKey = `${row.device_name}_${row.device_dev}`;
      const parentDevice = deviceMap.get(deviceUniqueKey);

      if (parentDevice) {
        parentDevice.points.push(point);
      }
    });
  });

  const result = Array.from(deviceMap.values());

  console.log("导入完整数据：", result);

  return result;
};

const transformDeviceRow = (row: any, protocol: string) => {
  const {
    uid,
    device_name,
    device_protocol,
    device_sn,
    device_dev,
    polling,
    description,
    enabled,
    ...property
  } = row;

  let address = "";

  if (device_protocol === DeviceTypeEnum.KNX) {
    address = `${property.gateway_ip}:${property.gateway_port}`;
  } else if (device_protocol === DeviceTypeEnum.ModbusTCP) {
    address = `${property.host}:${property.port}`;
  } else if (device_protocol === DeviceTypeEnum.BACnet) {
    address = `${property.address}:47808`;
  }

  return {
    uid: uid || generateTimeUniqueId(),
    device_name,
    device_type: device_protocol || protocol,
    device_sn,
    device_dev,
    polling: polling === "" ? 0 : Number(polling),
    description,
    enabled: enabled === "" ? false : Boolean(enabled),
    address: address,
    property: Object.keys(property).length ? property : undefined,
    points: [],
  };
};

const transformPointRow = (row: any, protocol: string) => {
  const {
    uid,
    device_name,
    device_dev,
    point_name,
    point_m,
    pkey,
    writable,
    status_address,
    control_address,
    register_address,
    register_count,
    register_type,
    ...property
  } = row;

  let mappedProperty = { ...property };

  if (protocol === "KNX") {
    mappedProperty = {
      ...mappedProperty,
      read_address: status_address,
      write_address: control_address,
    };
  }

  if (protocol === "ModbusTCP") {
    mappedProperty = {
      ...mappedProperty,
      address: register_address,
      count: register_count,
      function: register_type,
    };
  }

  return {
    uid: uid || generateTimeUniqueId(),
    point_name,
    point_m,
    description: pkey || row.description || "",
    writable: writable === "" ? false : Boolean(writable),
    property: Object.keys(mappedProperty).length ? mappedProperty : undefined,
  };
};
