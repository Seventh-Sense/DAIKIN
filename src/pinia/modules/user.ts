import { defineStore } from "pinia";
import { ref } from "vue";
import { loginApi } from "@/api";
import { routerTurnByName } from "@/router/util";
import { useStepStore } from "./step";

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref(null);
    const isLoading = ref(false);

    const login = async (params: any) => {
      //console.log('LoginParams', params)
      try {
        isLoading.value = true;
        //const res = await loginApi(params);
        userInfo.value = params;
        return Promise.resolve(params);
      } catch (error) {
        return Promise.reject(error);
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
