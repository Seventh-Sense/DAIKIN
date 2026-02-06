import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

interface PersistOptions {
  key: string;
  storage: Storage;
  paths: string[];
}

export const useStepStore = defineStore(
  "step",
  () => {
    const { t } = useI18n();

    const currentStep = ref<string | number>("");
    const menuSelectedKeys = ref<string[]>([]);
    const menuOpenKeys = ref<string[]>([]);

    const rawMenus = ref([
      {
        key: "1",
        icon: "deviceA",
        labelKey: "layout.professional", // 改用key存储，方便国际化
        children: [
          {
            key: "1-1",
            icon: "deviceA",
            label: "192.168.10.9", // 固定文本直接存
            children: [
              {
                key: "1-1-1",
                icon: "deviceA",
                labelKey: "layout.flow_1",
                path: "/home",
              },
              {
                key: "1-1-2",
                icon: "refresh",
                labelKey: "layout.flow_2",
                path: "/home/firmwareupdate",
              },
              {
                key: "1-1-3",
                icon: "addCircle",
                labelKey: "layout.flow_3",
                path: "/home/devices",
              },
              {
                key: "1-1-4",
                icon: "setting",
                labelKey: "layout.flow_4",
                path: "/home/mqtt",
              },
              {
                key: "1-1-5",
                icon: "multistate",
                labelKey: "layout.flow_5",
                path: "/home/ui",
              },
              {
                key: "1-1-6",
                icon: "checkCircle",
                labelKey: "layout.flow_6",
                path: "/home/check",
              },
            ],
          },
          {
            key: "1-2",
            icon: "deviceA",
            label: "192.168.10.10",
          },
        ],
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
        children: [
          {
            key: "3-1",
            icon: "deviceA",
            label: "192.168.10.10",
          },
        ],
      },
    ]);

    const menus = computed(() => {
      const processMenu = (menu: any) => {
        const processed = {
          ...menu,
          label: menu.labelKey ? t(menu.labelKey) : menu.label,
        };

        if (processed.children && processed.children.length) {
          processed.children = processed.children.map((sub: any) => processMenu(sub));
        }
        return processed;
      };

      return rawMenus.value.map((menu) => processMenu(menu));
    });


    const updateRawMenus = (newMenus: any[]) => {
      rawMenus.value = newMenus;
    };

    // 原有方法
    const updateCurrentStep = (step: string | number) => {
      currentStep.value = step;
    };

    const updateMenuSelectedKeys = (keys: string[]) => {
      menuSelectedKeys.value = keys;
    };

    const updateMenuOpenKeys = (keys: string[]) => {
      menuOpenKeys.value = keys;
    };

    return {
      currentStep,
      menuSelectedKeys,
      menuOpenKeys,
      rawMenus,
      menus,
      updateCurrentStep,
      updateMenuSelectedKeys,
      updateMenuOpenKeys,
      updateRawMenus,
    };
  },
  {
    // 开启持久化，刷新后状态不丢失
    persist: {
      key: "step-store",
      storage: sessionStorage,
      paths: ["currentStep", "menuSelectedKeys", "menuOpenKeys", "rawMenus"],
    } as PersistOptions,
  },
);
