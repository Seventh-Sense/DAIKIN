import { message } from "ant-design-vue";
import {
  ControllerTypeEnum,
  TypeOptions,
  DeviceTypeEnum,
  DataType,
} from "./options";
import { validateIPv4 } from "../../until/util";

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
  status: '',
  description: '',
  property: {
    host: data.property.host,
    port: data.property.port,
    connectionOption: data.property.connectionOption
  },
  tags: ''
})

export const createModbusRTUParams = (data: DataType) => ({
  uid: `ModbusRTU,${data.property.slaveid}`,
  name: data.name,
  address: data.property.slaveid.toString(),
  protocol: DeviceTypeEnum.ModbusRTU,
  enabled: true,
  status: '',
  description: '',
  property: {
    slaveid: data.property.slaveid,
    port: data.property.port,
    baudrate: data.property.baudrate,
    bytesize: data.property.bytesize,
    stopbits: data.property.stopbits,
    parity: data.property.parity,
    connectionOption: data.property.connectionOption
  },
  tags: ''
})

export const createKNXParams = (data: DataType) => ({
  uid: `KNX,${data.property.gateway_ip}:${data.property.gateway_port}`,
  name: data.name,
  address: data.property.gateway_ip,
  protocol: DeviceTypeEnum.KNX,
  enabled: true,
  status: '',
  description: '',
  property: {
    address_format: data.property.address_format,
    connection_type: data.property.connection_type,
    gateway_ip: data.property.gateway_ip,
    gateway_port: data.property.gateway_port
  },
  tags: ''
})
