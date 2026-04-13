const formatMessage = (key: string, params?: Record<string, any>) => {
  // 安全校验：确保i18n实例存在
  if (!window.$i18n) {
    console.warn("i18n instance is not initialized");
    return key; // 回退返回原始key
  }

  // 使用global.t方法进行翻译
  return window.$i18n.global.t(key);
};
export interface DataType {
  id: string;
  name: string;
  type: string;
  polling: number;
  enabled: number;
  property: null | any;
}

export enum ControllerTypeEnum {
  Pro = 1,
  Standard = 2,
  Lite = 3,
}

export enum DeviceTypeEnum {
  BACnet = "BACnet",
  ModbusTCP = "ModbusTCP",
  KNX = "KNX",
}

export const TypeOptions = [
  {
    label: "BACnet/IP",
    value: DeviceTypeEnum.BACnet,
  },
  {
    label: "ModbusTCP",
    value: DeviceTypeEnum.ModbusTCP,
  },
  {
    label: "KNX",
    value: DeviceTypeEnum.KNX,
  },
];

export const pollOptions = [
  {
    label: "200 ms",
    value: 0.2,
  },
  {
    label: "350 ms",
    value: 0.35,
  },
  {
    label: "500 ms",
    value: 0.5,
  },
  {
    label: "700 ms",
    value: 0.7,
  },
  {
    label: "1 sec",
    value: 1,
  },
  {
    label: "1.5 sec",
    value: 1.5,
  },
  {
    label: "2 sec",
    value: 2,
  },
  {
    label: "3",
    value: 3,
  },
  {
    label: "4 sec",
    value: 4,
  },
  {
    label: "5 sec",
    value: 5,
  },
  {
    label: "10 sec",
    value: 10,
  },
  {
    label: "30 sec",
    value: 30,
  },
  {
    label: "1 min",
    value: 60,
  },
];

export const baudOptions = [
  300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 56000, 57600, 115200,
  128000, 256000,
].map((v) => ({
  label: v,
  value: v,
}));

export const databitOptions = [7, 8].map((v) => ({
  label: v,
  value: v,
}));

export const connectionOptions = [
  {
    label: () => formatMessage("device_manage.serialport"),
    value: "SerialPort",
  },
];

export const parityOptions = [
  {
    label: () => formatMessage("device_manage.none"),
    value: "N",
  },
  {
    label: () => formatMessage("device_manage.odd"),
    value: "O",
  },
  {
    label: () => formatMessage("device_manage.even"),
    value: "E",
  },
];

export const stopbitOptions = [1, 2].map((v) => ({
  label: v,
  value: v,
}));

export const addrFormatOptions = [
  {
    label: () => formatMessage("device_manage.free"),
    value: 0,
  },
  {
    label: () => formatMessage("device_manage.short"),
    value: 2,
  },
  {
    label: () => formatMessage("device_manage.long"),
    value: 3,
  },
];

export const connectTypeOptions = [
  {
    label: () => formatMessage("device_manage.automatic"),
    value: 1,
  },
  {
    label: () => formatMessage("device_manage.routing"),
    value: 2,
  },
  {
    label: () => formatMessage("device_manage.routing_secure"),
    value: 3,
  },
  {
    label: () => formatMessage("device_manage.tunneling"),
    value: 4,
  },
  {
    label: () => formatMessage("device_manage.tunneling_tcp"),
    value: 5,
  },
];

export const functionOptions = [
  {
    label: "COIL",
    value: 0,
  },
  {
    label: "DIGITAL INPUT",
    value: 1,
  },
  {
    label: "INPUT REGISTER",
    value: 3,
  },
  {
    label: "HOLDING REGISTER",
    value: 4,
  },
];

export const OrderOptions = [
  {
    label: () => formatMessage("device_manage.little_endian"),
    value: 0,
  },
  {
    label: () => formatMessage("device_manage.big_endian"),
    value: 1,
  },
];

export const DatatypeOptions = [
  "bool",
  "boolean",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "float16",
  "float32",
  "float",
].map((v) => ({
  label: v,
  value: v,
}));

export const KNXValueTypeOptions = [
  "switch",
  "binary",
  "bool",
  "boolean",
  "temperature",
  "humidity",
  "float",
  "analog",
  "percent",
  "brightness",
  "int",
  "integer",
  "multiState",
].map((v) => ({
  label: v,
  value: v,
}));
// export const KNXValueTypeOptions = [
//   {
//     label: () => formatMessage("device_manage.bool"),
//     value: "bool",
//   },
//   {
//     label: () => formatMessage("device_manage.percent"),
//     value: "percent",
//   },
// ];

export const PriorityOption = [
  { label: "None", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
  { label: "13", value: 13 },
  { label: "14", value: 14 },
  { label: "15", value: 15 },
  { label: "16", value: 16 },
];

export const BooleanOption = [
  { label: "True", value: 1 },
  { label: "False", value: 0 },
];

export const WritableOption = [
  { label: "True", value: true },
  { label: "False", value: false },
];

export const AlignmentOption = [
  { label: "AB", value: 0 },
  { label: "BA", value: 1 },
  { label: "ABCD", value: 2 },
  { label: "BADC", value: 3 },
  { label: "CDAB", value: 4 },
  { label: "DCBA", value: 5 },
];
