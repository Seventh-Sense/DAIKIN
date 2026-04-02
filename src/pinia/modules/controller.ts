import { defineStore } from "pinia";
import { ref } from "vue";
import LZString from "lz-string";

interface PersistOptions {
  key: string;
  storage: Storage;
  paths: string[];
}

interface ControllerInfo {
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

    // 清空所有
    const clearAll = () => {
      controllerMap.value = {};
    };

    return {
      controllerMap,
      addController,
      getControllerByIp,
      clearAll,
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
