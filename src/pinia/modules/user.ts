import { defineStore } from "pinia";
import { ref } from "vue";
import { loginApi } from "@/api";
import { routerTurnByName } from "@/router/util";
import { useStepStore } from "./step";
import type { AxiosError } from "axios";

interface PersistOptions {
  key: string;
  storage: Storage;
  paths: string[];
}

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref<any>(null);

    const login = async (params: any) => {
      try {
        const res = await loginApi(params);
        //console.log("LoginParams", res);
        //缓存用户信息
        const { username } = params;
        userInfo.value = { username, ...res };

        return Promise.resolve("OK");
      } catch (error) {
        const err = error as AxiosError;
        return Promise.reject(err.response?.data);
      }
    };

    const logout = () => {
      userInfo.value = null;

      const stepStore = useStepStore();
      stepStore.reset();

      routerTurnByName("Login", true, false);
    };

    return {
      userInfo,
      login,
      logout,
    };
  },
  {
    persist: {
      key: "userToken",
      storage: localStorage,
      paths: ["userInfo"],
    } as PersistOptions,
  },
);
