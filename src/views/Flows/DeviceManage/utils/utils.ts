import { message } from "ant-design-vue";
import {
  ControllerTypeEnum,
  TypeOptions,
  DeviceTypeEnum,
  DataType,
} from "./options";
import { validateIPv4 } from "../../until/util";
import { PropertyConstants } from "./propertyID";
import unitsJson from "./Units.json";

export const formatMessage = (key: string, params?: Record<string, any>) => {
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
    case DeviceTypeEnum.ModbusRTU:
      return validateModbusRTU(deviceData);
    case DeviceTypeEnum.KNX:
      return validateKNX(deviceData);
    default:
      return false;
  }
};

const validateModbusTCP = (data: DataType): boolean => {
  if (
    !data.name ||
    !data.property.host ||
    data.property.port === null ||
    data.address === null
  ) {
    message.warn(formatMessage("device_manage.emptyField"));
    return true;
  }

  if (!validateIPv4(data.property.host)) {
    message.warn(formatMessage("device_manage.invalidIp"));
    return true;
  }

  return false;
};

const validateModbusRTU = (data: DataType): boolean => {
  if (!data.name || !data.property.port || data.property.slaveid === null) {
    message.warn(formatMessage("device_manage.emptyField"));
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
  uid: `ModbusTCP,${data.property.host}:${data.property.port}`,
  name: data.name,
  address: data.address.toString(),
  protocol: DeviceTypeEnum.ModbusTCP,
  enabled: true,
  status: "",
  description: "",
  property: {
    host: data.property.host,
    port: data.property.port,
    connectionOption: data.property.connectionOption,
  },
  tags: "",
});

export const createModbusRTUParams = (data: DataType) => ({
  uid: `ModbusRTU,${data.property.slaveid}`,
  name: data.name,
  address: data.property.slaveid.toString(),
  protocol: DeviceTypeEnum.ModbusRTU,
  enabled: true,
  status: "",
  description: "",
  property: {
    slaveid: data.property.slaveid,
    port: data.property.port,
    baudrate: data.property.baudrate,
    bytesize: data.property.bytesize,
    stopbits: data.property.stopbits,
    parity: data.property.parity,
    connectionOption: data.property.connectionOption,
  },
  tags: "",
});

export const createKNXParams = (data: DataType) => ({
  uid: `KNX,${data.property.gateway_ip}:${data.property.gateway_port}`,
  name: data.name,
  address: data.property.gateway_ip,
  protocol: DeviceTypeEnum.KNX,
  enabled: true,
  status: "",
  description: "",
  property: {
    address_format: data.property.address_format,
    connection_type: data.property.connection_type,
    gateway_ip: data.property.gateway_ip,
    gateway_port: data.property.gateway_port,
  },
  tags: "",
});

export const markExistingIds = (arrayA: any[], arrayB: any[]) => {
  // 提前判空，避免arrayB为undefined/null时报错
  if (!Array.isArray(arrayB))
    return arrayA.map((item) => ({ ...item, disabled: false }));

  // 简化Set创建逻辑
  const existingIds = new Set(arrayB.map((item) => item.device_id));

  // 简化map逻辑，直接返回增强后的对象
  return arrayA.map((item) => ({
    ...item,
    disabled: existingIds.has(item.id),
  }));
};

export const ModbusRTUData = {
  slaveid: 1,
  connectionOption: "SerialPort",
  port: "",
  baudrate: 9600,
  bytesize: 8,
  stopbits: 1,
  parity: "N",
};

export const ModbusTCPData = {
  slaveid: 1,
  host: "127.0.0.1",
  port: 5020,
  connectionOption: "tcp",
};

export const KNXData = {
  address_format: 3,
  connection_type: 1,
  gateway_ip: "127.0.0.255",
  gateway_port: 3671,
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
  let text = ''

  if (value.length === 2) {
    text = getDeviceTypeName(value[0]) + ',' + value[1]
  }
  return text
}

export const unitsTrans = (value: any) => {
  let text = ''

  Object.entries(unitsJson).forEach(([key, val]) => {
    if (parseInt(key) === value) {
      text = val
    }
  })

  //console.log('unitsTrans', value, text)

  return text
}

export const presentValueTrans = (value: any, type: string, BinaryOption: any, MVOption: any) => {
  let text = value

  //console.log('presentValueTrans', value, type, BinaryOption, MVOption)

  if (type === TypeEnum.AI || type === TypeEnum.AV || type === TypeEnum.AO) {
    text = value
  } else if (type === TypeEnum.BI || type === TypeEnum.BV || type === TypeEnum.BO) {
    if (BinaryOption.length === 2) {
      BinaryOption.forEach((item: any) => {
        if (item.value === value) {
          text = item.label
        }
      })
    } else {
      text = value
    }
  } else if (type === TypeEnum.MV) {
    if (MVOption.length > 0) {
      MVOption.forEach((item: any) => {
        if (item.value === value) {
          text = item.label
        }
      })
    } else {
      text = value
    }
  }

  return text
}

export const isPriority = (type: string) => {
  let flag = false

  if (
    type === TypeEnum.MV ||
    type === TypeEnum.BV ||
    type === TypeEnum.BO ||
    type === TypeEnum.AV ||
    type === TypeEnum.AO
  ) {
    flag = true
  }

  return flag
}