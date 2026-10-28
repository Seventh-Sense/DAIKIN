import { defineStore } from "pinia";
import { ref } from "vue";
import LZString from "lz-string";

interface PersistOptions {
  key: string;
  storage: Storage;
  paths: string[];
}

interface ControllerInfo {
  devices?: any[];
  mqtt?: any;
  ntp?: any;
  [key: string]: any;
}

const compressedStorage = {
  getItem(key: string) {
    const item = sessionStorage.getItem(key);
    return item ? LZString.decompress(item) : null;
  },
  setItem(key: string, value: string) {
    sessionStorage.setItem(key, LZString.compress(value));
  },
  removeItem(key: string) {
    sessionStorage.removeItem(key);
  },
};

export const useControllerStore = defineStore(
  "controller",
  () => {
    const controllerMap = ref<Record<string, ControllerInfo>>({});
    const currentAdress = ref<string>('')

    const setCurrentAdress = (ip: string) => {
      currentAdress.value = ip
    }

    const getCurrentAdress = () => {
      return currentAdress.value
    }

    // 添加/更新控制器（ip 只做 key，不放入对象）
    const addController = (ip: string, controller: ControllerInfo) => {
      controllerMap.value[ip] = controller;
    };

    const setControllerDevices = (ip: string, devices: any[]) => {
      const controller = controllerMap.value[ip];
      if (!controller) {
        console.log("找不到控制器: setControllerDevices", ip);
        return;
      }
      // 直接覆盖整个 devices 数组
      controller.devices = Array.isArray(devices) ? devices : [];
    };

    // 根据 ip 获取控制器
    const getControllerByIp = (ip: string): ControllerInfo | undefined => {
      return controllerMap.value[ip];
    };

    // 根据 ip 获取所有设备
    const getControllerDevices = (ip: string) => {
      return controllerMap.value[ip]?.devices || [];
    };

    const getControllerPointsByDeviceId = (ip: string, deviceid: string) => {
      const controller = controllerMap.value[ip];
      if (!controller || !Array.isArray(controller.devices)) return [];

      const device = controller.devices.find((item) => item.uid === deviceid);
      if (!device) return [];

      return device.points || [];
    };

    // 根据 ip 添加设备
    const addDeviceToController = (ip: string, device: any) => {
      const controller = controllerMap.value[ip];
      if (!controller) {
        console.log("找不到控制器: addDeviceToController", ip);
        return;
      }

      if (!Array.isArray(controller.devices)) {
        controller.devices = [];
      }

      if (!device?.uid) {
        console.warn("设备缺少唯一标识 uid", device);
        return;
      }

      const existIndex = controller.devices.findIndex(
        (item) => item.uid === device.uid,
      );

      if (existIndex > -1) {
        // 存在 → 替换
        const oldDevice = controller.devices[existIndex];
        controller.devices[existIndex] = {
          ...oldDevice, // 保留原有所有字段（包括 points）
          ...device, // 用新传入的设备信息覆盖基础字段
          points: oldDevice.points || [], // 强制保留旧 points，不被覆盖
        };
      } else {
        // 不存在 → 新增
        controller.devices.push(device);
      }
    };

    //删除指定设备
    const deleteDeviceFromController = (ip: string, deviceid: string) => {
      const controller = controllerMap.value[ip];
      if (!controller) {
        console.log("找不到控制器: deleteDeviceFromController", ip);
        return;
      }

      if (
        !Array.isArray(controller.devices) ||
        controller.devices.length === 0
      ) {
        console.log("控制器无设备可删除", ip);
        return;
      }

      controller.devices = controller.devices.filter(
        (device) => device.uid !== deviceid,
      );
    };

    //add point
    const addPointToControllerDevice = (
      ip: string,
      deviceid: string,
      point: any,
    ) => {
      const controller = controllerMap.value[ip];
      if (!controller) {
        console.log("找不到控制器: addPointToController", ip);
        return;
      }

      const device = controller.devices?.find((item) => item.uid === deviceid);
      if (!device) {
        console.log("找不到设备: addPointToController", deviceid);
        return;
      }

      if (!Array.isArray(device.points)) {
        device.points = [];
      }

      if (!point?.uid) {
        console.warn("点位缺少唯一标识 uid", point);
        return;
      }

      const existIndex = device.points.findIndex(
        (item: any) => item.uid === point.uid,
      );
      if (existIndex > -1) {
        device.points[existIndex] = point;
      } else {
        device.points.push(point);
      }
    };

    const deletePointFromControllerDevice = (
      ip: string,
      deviceid: string,
      pointid: string,
    ) => {
      const controller = controllerMap.value[ip];
      if (!controller) {
        console.log("找不到控制器: deletePointFromControllerDevice", ip);
        return;
      }

      const device = controller.devices?.find((item) => item.uid === deviceid);
      if (!device) {
        console.log("找不到设备: deletePointFromControllerDevice", deviceid);
        return;
      }

      if (!Array.isArray(device.points) || device.points.length === 0) {
        console.log("设备无点位可删除", deviceid);
        return;
      }

      device.points = device.points.filter(
        (point: any) => point.uid !== pointid,
      );
    };

    const clearAllPointsByDeviceID = (ip: string, deviceid: string) => {
      const controller = controllerMap.value[ip];
      if (!controller) {
        console.log("找不到控制器: clearAllPointsByDeviceID", ip);
        return;
      }

      const device = controller.devices?.find((item) => item.uid === deviceid);
      if (!device) {
        console.log("找不到设备: clearAllPointsByDeviceID", deviceid);
        return;
      }

      device.points = [];
    };

    // 删除指定控制器
    const deleteControllerByIp = (ip: string) => {
      if (!controllerMap.value[ip]) {
        console.log("找不到控制器: deleteControllerByIp", ip);
        return;
      }
      // 直接删除对应 ip 的数据
      delete controllerMap.value[ip];
    };

    // 设置 NTP 配置
    const setControllerNtp = (
      ip: string,
      ntpData: {
        ip: string;
        port: number | string;
        interval: number | string;
      },
    ) => {
      const controller = controllerMap.value[ip];
      if (!controller) {
        console.log("找不到控制器: setControllerNtp", ip);
        return false;
      }
      controller.ntp = {
        ip: ntpData.ip,
        port: Number(ntpData.port),
        interval: Number(ntpData.interval),
      };
      return true;
    };

    // 获取 NTP 配置
    const getControllerNtp = (ip: string) => {
      return controllerMap.value[ip]?.ntp || null;
    };

    // 清空所有
    const clearAll = () => {
      controllerMap.value = {};
      currentAdress.value = "";
    };

    // --- MQTT 多记录 Counter 管理（每个控制器独立维护） ---
    // 主系列: [1000, 2000),  从系列: [2000, 3000)
    const PRIMARY_BASE = 1000;
    const PRIMARY_MAX = 2000;
    const SECONDARY_BASE = 2000;
    const SECONDARY_MAX = 3000;

    // 在 [base, max) 范围内找到当前 ctrl.mqtt 中第一个未被占用的编号
    const findFirstAvailable = (
      ctrl: ControllerInfo,
      base: number,
      max: number,
    ): number => {
      const used = new Set<number>();
      if (ctrl.mqtt) {
        for (const key of Object.keys(ctrl.mqtt)) {
          const num = parseInt(key.replace("mqtt", ""), 10);
          if (!Number.isNaN(num) && num >= base && num < max) {
            used.add(num);
          }
        }
      }
      for (let n = base; n < max; n++) {
        if (!used.has(n)) return n;
      }
      return base; // 全满兜底（理论上 Topic 上限 64 永远不会到）
    };

    // 把 ctrl.mqtt 内 [base, max) 范围的 key 重新编号为紧凑连续的 mqtt{base+idx}
    const renumberMqtt = (ctrl: ControllerInfo, base: number, max: number): void => {
      if (!ctrl.mqtt) return;
      const oldKeys = Object.keys(ctrl.mqtt)
        .filter((k) => {
          const n = parseInt(k.replace("mqtt", ""), 10);
          return !Number.isNaN(n) && n >= base && n < max;
        })
        .sort((a, b) => parseInt(a.replace("mqtt", ""), 10) - parseInt(b.replace("mqtt", ""), 10));

      oldKeys.forEach((oldKey, idx) => {
        const newKey = `mqtt${base + idx}`;
        if (oldKey !== newKey) {
          ctrl.mqtt[newKey] = ctrl.mqtt[oldKey];
          delete ctrl.mqtt[oldKey];
        }
      });
    };

    const nextMqttPrimaryKey = (ip: string): string => {
      const ctrl = controllerMap.value[ip];
      if (!ctrl) return `mqtt${PRIMARY_BASE}`;
      renumberMqtt(ctrl, PRIMARY_BASE, PRIMARY_MAX);
      const count = Object.keys(ctrl.mqtt).filter((k) => {
        const n = parseInt(k.replace("mqtt", ""), 10);
        return !Number.isNaN(n) && n >= PRIMARY_BASE && n < PRIMARY_MAX;
      }).length;
      return `mqtt${PRIMARY_BASE + count}`;
    };

    const nextMqttSecondaryKey = (ip: string): string => {
      const ctrl = controllerMap.value[ip];
      if (!ctrl) return `mqtt${SECONDARY_BASE}`;
      renumberMqtt(ctrl, SECONDARY_BASE, SECONDARY_MAX);
      const count = Object.keys(ctrl.mqtt).filter((k) => {
        const n = parseInt(k.replace("mqtt", ""), 10);
        return !Number.isNaN(n) && n >= SECONDARY_BASE && n < SECONDARY_MAX;
      }).length;
      return `mqtt${SECONDARY_BASE + count}`;
    };

    // 判断 mqtt key 属于主系列还是从系列
    const isPrimaryKey = (key: string): boolean => {
      const num = parseInt(key.replace("mqtt", ""), 10);
      return num >= 1000 && num < 2000;
    };

    const isSecondaryKey = (key: string): boolean => {
      const num = parseInt(key.replace("mqtt", ""), 10);
      return num >= 2000 && num < 3000;
    };

    // 删除某系列的所有 mqtt 记录
    const deleteMqttSeries = (ip: string, series: "primary" | "secondary") => {
      const ctrl = controllerMap.value[ip];
      if (!ctrl || !ctrl.mqtt) return;
      for (const key of Object.keys(ctrl.mqtt)) {
        const num = parseInt(key.replace("mqtt", ""), 10);
        if (series === "primary" && num >= 1000 && num < 2000) {
          delete ctrl.mqtt[key];
        } else if (series === "secondary" && num >= 2000 && num < 3000) {
          delete ctrl.mqtt[key];
        }
      }
    };

    // 返回所有 mqtt 主系列 keys / 从系列 keys
    const getMqttKeysBySeries = (ip: string, series: "primary" | "secondary"): string[] => {
      const ctrl = controllerMap.value[ip];
      if (!ctrl || !ctrl.mqtt) return [];
      return Object.keys(ctrl.mqtt).filter((key) => {
        const num = parseInt(key.replace("mqtt", ""), 10);
        return series === "primary" ? num >= 1000 && num < 2000 : num >= 2000 && num < 3000;
      });
    };

    return {
      controllerMap,
      currentAdress,
      addController,
      getControllerByIp,
      clearAll,
      addDeviceToController,
      getControllerDevices,
      deleteDeviceFromController,
      getControllerPointsByDeviceId,
      addPointToControllerDevice,
      deletePointFromControllerDevice,
      clearAllPointsByDeviceID,
      setControllerDevices,
      deleteControllerByIp,
      setControllerNtp,
      getControllerNtp,
      setCurrentAdress,
      getCurrentAdress,
      nextMqttPrimaryKey,
      nextMqttSecondaryKey,
      isPrimaryKey,
      isSecondaryKey,
      deleteMqttSeries,
      getMqttKeysBySeries,
    };
  },
  {
    persist: {
      key: "controllerState",
      storage: localStorage,
      paths: ["controllerMap", "currentAdress"],
    } as PersistOptions,
  },
);
