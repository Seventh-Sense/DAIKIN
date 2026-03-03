export interface DataType {
  id: string;
  name: string;
  type: string;
  polling: number;
  enabled: boolean;
  address: number;
  property: null | any;
}

export enum ControllerTypeEnum {
  Pro = 1,
  Standard = 2,
  Lite = 3,
}

export enum DeviceTypeEnum {
  BACnet = "bacnet",
  ModbusRTU = "ModbusRTU",
  ModbusTCP = "ModbusTCP",
  KNX = "KNX",
}

export const TypeOptions = [
  {
    label: "BACnet/IP",
    value: DeviceTypeEnum.BACnet,
  },
  {
    label: "ModbusRTU",
    value: DeviceTypeEnum.ModbusRTU,
  },
  {
    label: "ModbusTCP",
    value: DeviceTypeEnum.ModbusTCP,
  },
  {
    label: "KNX",
    value: DeviceTypeEnum.KNX,
  }
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
