import { defineStore } from "pinia";
import { ref } from "vue";
import { loginApi } from "@/api";
import { routerTurnByName } from "@/router/util";
import { useStepStore } from "./step";
import type { AxiosError } from "axios";

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref<any>(null);
    const isLoading = ref<Boolean>(false);

    const login = async (params: any) => {
      //console.log('LoginParams', params)
      try {
        isLoading.value = true;
        const res = await loginApi(params);

        //缓存用户信息
        const { username, password } = params;
        userInfo.value = { username, password, ...res };

        return Promise.resolve("OK");
      } catch (error) {
        const err = error as AxiosError;
        return Promise.reject(err.response?.data);
      } finally {
        isLoading.value = false;
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
      isLoading,
      login,
      logout,
    };
  },
  {
    persist: {
      key: "userToken",
      storage: localStorage,
      paths: ["userInfo"],
    } as any,
  },
);
