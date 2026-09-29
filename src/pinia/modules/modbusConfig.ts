import { defineStore } from "pinia";
import { DeviceTypeEnum } from "@/views/Flows/DeviceManage/utils/options";
import { useControllerStore } from "./controller";

export interface PortParams {
  baudrate: number;
  data_bit: number;
  parity: string;
  stop_bit: number;
}

const DEFAULT_PARAMS: PortParams = {
  baudrate: 38400,
  data_bit: 8,
  parity: "N",
  stop_bit: 1,
};

const ALL_PORTS = ["Modbus1", "Modbus2", "Modbus3", "Modbus4"] as const;

type PortMap = Record<string, PortParams>;

function createDefaultMap(): PortMap {
  return ALL_PORTS.reduce((acc, port) => {
    acc[port] = { ...DEFAULT_PARAMS };
    return acc;
  }, {} as PortMap);
}

export const useModbusConfigStore = defineStore("modbusConfig", {
  state: () => ({
    // 按控制器 IP 隔离：每个 IP 独立的串口参数映射
    controllerPortMaps: {} as Record<string, PortMap>,
  }),
  actions: {
    // 获取指定控制器 + 串口的参数（编辑时读取）
    getPortParams(ip: string, portName: string): PortParams {
      const map = this.controllerPortMaps[ip];
      if (!map) return { ...DEFAULT_PARAMS };
      return map[portName] ?? { ...DEFAULT_PARAMS };
    },
    // 更新指定控制器 + 串口的参数（仅保存时调用）
    updatePortParams(ip: string, portName: string, params: Partial<PortParams>) {
      if (!this.controllerPortMaps[ip]) {
        this.controllerPortMaps[ip] = createDefaultMap();
      }
      this.controllerPortMaps[ip][portName] = {
        ...this.controllerPortMaps[ip][portName],
        ...params,
      };
    },
    // 从设备列表回填（页面初始化时）
    restoreFromDevices(ip: string, devices: any[]) {
      if (!this.controllerPortMaps[ip]) {
        this.controllerPortMaps[ip] = createDefaultMap();
      }
      devices?.forEach((device) => {
        if (device.protocol !== DeviceTypeEnum.ModbusRTU) return;
        const prop = device.property;
        if (!prop?.serial_port) return;
        if (prop.baudrate == null) return;
        this.updatePortParams(ip, prop.serial_port, {
          baudrate: prop.baudrate,
          data_bit: prop.data_bit,
          parity: prop.parity,
          stop_bit: prop.stop_bit,
        });
      });
    },
    // ★ 仅保存时调用：把 store 里的参数全量写回 controllerMap
    syncToControllerMap(ip: string) {
      const controllerStore = useControllerStore();
      const controller = controllerStore.getControllerByIp(ip);
      if (!controller?.devices?.length) return;

      const portMap = this.controllerPortMaps[ip];
      if (!portMap) return;

      controller.devices.forEach((device: any) => {
        if (device.protocol !== DeviceTypeEnum.ModbusRTU) return;
        const prop = device.property;
        if (!prop?.serial_port) return;
        const params = portMap[prop.serial_port];
        if (!params) return;
        prop.baudrate = params.baudrate;
        prop.data_bit = params.data_bit;
        prop.parity = params.parity;
        prop.stop_bit = params.stop_bit;
      });
      // controllerMap 是 Pinia ref，修改自动触发持久化
    },
    // 清理（删除控制器时）
    clearByIp(ip: string) {
      delete this.controllerPortMaps[ip];
    },
  },
  persist: {
    key: "modbus_config",
    storage: localStorage,
  },
});
