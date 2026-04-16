import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

interface PersistOptions {
  key: string;
  storage: Storage;
  paths: string[];
}

const getInitialState = () => ({
  currentStep: "" as string,
  menuSelectedKeys: [] as string[],
  menuOpenKeys: [] as string[],
  rawMenus: [
    {
      key: "1",
      icon: "deviceA",
      labelKey: "layout.professional",
      children: [],
    },
    {
      key: "2",
      icon: "deviceA",
      labelKey: "layout.standard",
      children: [],
    },
    {
      key: "3",
      icon: "deviceA",
      labelKey: "layout.lite",
      children: [],
    },
  ],
  currentMenuData: {} as any,
  currentDeviceInfo: {} as any,
  currentNetworkInterface: "",
});

export const useStepStore = defineStore(
  "step",
  () => {
    const { t } = useI18n();

    const initialState = getInitialState();

    const currentStep = ref<string>(initialState.currentStep);
    const menuSelectedKeys = ref<string[]>(initialState.menuSelectedKeys);
    const menuOpenKeys = ref<string[]>(initialState.menuOpenKeys);
    const rawMenus = ref(initialState.rawMenus);
    //当前点击项的数据(二级菜单的地址，添加的控制器信息，当前步骤，所有步骤)
    const currentMenuData = ref(initialState.currentMenuData);

    //设备管理，当前设备信息
    const currentDeviceInfo = ref<any>({});

    const menus = computed(() => {
      const processMenu = (menu: any) => {
        const processed = {
          ...menu,
          label: menu.labelKey ? t(menu.labelKey) : menu.label,
        };

        if (processed.children && processed.children.length) {
          processed.children = processed.children.map((sub: any) =>
            processMenu(sub),
          );
        }
        return processed;
      };

      return rawMenus.value.map((menu) => processMenu(menu));
    });

    const updateRawMenus = (newMenus: any[]) => {
      rawMenus.value = newMenus;
    };

    // 原有方法
    const updateCurrentStep = (step: string) => {
      currentStep.value = step;
    };

    const updateMenuSelectedKeys = (keys: string[]) => {
      menuSelectedKeys.value = keys;
    };

    const updateMenuOpenKeys = (keys: string[]) => {
      menuOpenKeys.value = keys;
    };

    const updateCurrentMenuData = (data: any) => {
      currentMenuData.value = data;
    };

    const getCurrentIP = () => {
      return currentMenuData.value.label;
    };

    const reset = () => {
      const init = getInitialState();
      currentStep.value = init.currentStep;
      menuSelectedKeys.value = init.menuSelectedKeys;
      menuOpenKeys.value = init.menuOpenKeys;
      currentMenuData.value = init.currentMenuData;
      currentDeviceInfo.value = init.currentDeviceInfo;
      rawMenus.value = init.rawMenus;
    };

    const setCurrentDeviceInfo = (deviceInfo: any) => {
      currentDeviceInfo.value = deviceInfo;
    };

    const getCurrentDeviceInfo = () => {
      return currentDeviceInfo.value;
    };

    return {
      currentStep,
      menuSelectedKeys,
      menuOpenKeys,
      rawMenus,
      menus,
      currentMenuData,
      updateCurrentStep,
      updateMenuSelectedKeys,
      updateMenuOpenKeys,
      updateRawMenus,
      updateCurrentMenuData,
      getCurrentIP,
      reset,
      currentDeviceInfo,
      setCurrentDeviceInfo,
      getCurrentDeviceInfo,
    };
  },
  {
    // 开启持久化，刷新后状态不丢失
    persist: {
      key: "step-store",
      storage: sessionStorage,
      paths: [
        "currentStep",
        "menuSelectedKeys",
        "menuOpenKeys",
        "rawMenus",
        "currentMenuData",
        "currentDeviceInfo",
      ],
    } as PersistOptions,
  },
);
