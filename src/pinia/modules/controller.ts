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

    // 根据 ip 获取控制器
    const getControllerByIp = (ip: string): ControllerInfo | undefined => {
      return controllerMap.value[ip];
    };

    // 根据 ip 获取所有设备
    const getControllerDevices = (ip: string) => {
      return controllerMap.value[ip]?.devices || [];
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
        controller.devices[existIndex] = device;
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
    const addPointToController = (ip: string, point: any) => {};

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
