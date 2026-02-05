import { defineStore } from "pinia";
import { ref } from "vue";

interface PersistOptions {
  key: string;
  storage: Storage;
  paths: string[];
}

export const useStepStore = defineStore(
  "step",
  () => {
    // 原有状态
    const currentStep = ref<string | number>("");

    //菜单选中的key
    const menuSelectedKeys = ref<string[]>([]);
    //菜单展开的key
    const menuOpenKeys = ref<string[]>([]);

    // 原有方法
    const updateCurrentStep = (step: string | number) => {
      currentStep.value = step;
    };

    // 更新菜单选中状态
    const updateMenuSelectedKeys = (keys: string[]) => {
      menuSelectedKeys.value = keys;
    };

    // 更新菜单展开状态
    const updateMenuOpenKeys = (keys: string[]) => {
      menuOpenKeys.value = keys;
    };

    return {
      currentStep,
      menuSelectedKeys,
      menuOpenKeys,
      updateCurrentStep,
      updateMenuSelectedKeys,
      updateMenuOpenKeys,
    };
  },
  {
    // 开启持久化，刷新后状态不丢失
    persist: {
      key: "step-store",
      storage: sessionStorage,
      paths: ["currentStep", "menuSelectedKeys", "menuOpenKeys"],
    } as PersistOptions,
  },
);
