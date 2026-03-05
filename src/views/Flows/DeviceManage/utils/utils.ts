import { message } from "ant-design-vue";
import {
  ControllerTypeEnum,
  TypeOptions,
  DeviceTypeEnum,
  DataType,
} from "./options";
import { validateIPv4 } from "../../until/util";
import { PropertyConstants } from "./propertyID";

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

//生成模拟数据
export const generateMockDeviceData = (count: number = 10): any[] => {
  // 预设厂商列表
  const vendorList = [
    "华为技术有限公司",
    "西门子（中国）有限公司",
    "施耐德电气",
    "三菱电机",
    "ABB集团",
    "罗克韦尔自动化",
    "欧姆龙自动化",
    "研华科技",
    "台达电子",
    "汇川技术",
  ];

  // 生成指定条数的模拟数据
  return Array.from({ length: count }, (_, index) => {
    const deviceId = `DEV-${1000 + index}`;
    return {
      object_name: `工业设备${index + 1}`,
      id: deviceId,
      address: `${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      // 若count超过厂商列表长度，循环使用厂商名称
      vendor_name: vendorList[index % vendorList.length],
      actions: "",
    };
  });
};

export const generateTestData = (count: number): any[] => {
  const dataList: any[] = [];

  // 按设备类型分类的型号列表
  const deviceModels = {
    [DeviceTypeEnum.BACnet]: [
      "BAC-3551-240",
      "BAC-3551-241",
      "BAC-3552-242",
      "BAC-3553-243",
      "BAC-3554-244",
    ],
    [DeviceTypeEnum.ModbusRTU]: [
      "MB-RTU-1001",
      "MB-RTU-1002",
      "MB-RTU-2001",
      "MB-RTU-2002",
      "MB-RTU-3001",
    ],
    [DeviceTypeEnum.ModbusTCP]: [
      "MB-TCP-4001",
      "MB-TCP-4002",
      "MB-TCP-5001",
      "MB-TCP-5002",
      "MB-TCP-6001",
    ],
    [DeviceTypeEnum.KNX]: [
      "KNX-EIB-101",
      "KNX-EIB-102",
      "KNX-EIB-201",
      "KNX-EIB-202",
      "KNX-EIB-301",
    ],
  };

  // 轮询时间选项
  const pollingOptions = [1, 2, 3, 4, 5];
  // 所有设备类型数组（用于随机选择）
  const deviceTypes = Object.values(DeviceTypeEnum);

  for (let i = 1; i <= count; i++) {
    // 生成唯一的UUID格式key
    const uuid = `${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 12)}`;

    // 1. 随机选择设备类型
    const randomDeviceType =
      deviceTypes[Math.floor(Math.random() * deviceTypes.length)];

    // 2. 根据设备类型选择对应型号
    const randomModel =
      deviceModels[randomDeviceType][
        Math.floor(Math.random() * deviceModels[randomDeviceType].length)
      ];

    // 3. 随机轮询时间
    const randomPolling =
      pollingOptions[Math.floor(Math.random() * pollingOptions.length)];

    // 4. 生成对应类型的地址和标准化properties
    let address = "";
    let properties: any = { "model-name": randomModel }; // 基础属性

    // 按标准格式生成各类型的properties
    switch (randomDeviceType) {
      case DeviceTypeEnum.BACnet:
        address = `192.168.20.${50 + i}`;
        properties = {
          ...properties,
          "vendor-name": "Adveco",
        };
        break;

      case DeviceTypeEnum.ModbusRTU:
        const serialPort = `/dev/ttyUSB${Math.floor(Math.random() * 10)}`;
        address = serialPort;
        // 严格匹配ModbusRTUData格式
        properties = {
          ...properties,
          slaveid: Math.floor(Math.random() * 247) + 1, // 1-247
          connectionOption: "SerialPort",
          port: serialPort,
          baudrate: [9600, 19200, 38400, 57600][Math.floor(Math.random() * 4)],
          bytesize: 8, // 固定8位
          stopbits: [1, 2][Math.floor(Math.random() * 2)], // 1或2位
          parity: ["N", "O", "E"][Math.floor(Math.random() * 3)], // 无/奇/偶校验
        };
        break;

      case DeviceTypeEnum.ModbusTCP:
        const tcpHost = `192.168.30.${50 + i}`;
        const tcpPort = 502 + Math.floor(Math.random() * 10); // 502-511
        address = `${tcpHost}:${tcpPort}`;
        // 严格匹配ModbusTCPData格式
        properties = {
          ...properties,
          slaveid: Math.floor(Math.random() * 247) + 1, // 1-247
          host: tcpHost,
          port: tcpPort,
          connectionOption: "tcp",
        };
        break;

      case DeviceTypeEnum.KNX:
        const knxGatewayIp = `192.168.40.${50 + i}`;
        address = knxGatewayIp;
        // 严格匹配KNXData格式
        properties = {
          ...properties,
          address_format: [2, 3][Math.floor(Math.random() * 2)], // 2或3格式
          connection_type: [1, 2][Math.floor(Math.random() * 2)], // 1或2类型
          gateway_ip: knxGatewayIp,
          gateway_port: 3671, // 固定KNX网关端口
        };
        break;
    }

    // 随机enabled状态（80%概率为true）
    const isEnabled = Math.random() > 0.2;
    // 随机点数
    const pointCount = Math.floor(Math.random() * 5000) + 500;

    dataList.push({
      key: uuid,
      device_id: `device_${50 + i}`,
      device_name: `${randomModel}_${randomDeviceType}_${50 + i}_${pointCount}点`,
      device_type: randomDeviceType,
      polling: randomPolling,
      address: address,
      status: "",
      enabled: isEnabled,
      properties: properties, // 标准化的属性格式
      tags: i % 10 === 0 ? `tag_${i}` : "",
      description: i % 20 === 0 ? `${randomDeviceType}设备描述${i}` : "",
    });
  }

  return dataList;
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
