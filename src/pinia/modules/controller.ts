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

    // 清空所有
    const clearAll = () => {
      controllerMap.value = {};
    };

    return {
      controllerMap,
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
    };
  },
  {
    persist: {
      key: "controllerState",
      storage: sessionStorage,
      paths: ["controllerMap"],
    } as PersistOptions,
  },
);
