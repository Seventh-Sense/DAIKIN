import { defineStore } from "pinia";
import { ref } from "vue";
import type { UserInfo, LoginParams } from "@/types/user";
import { loginApi } from "@/api";
import LocalStorageUtils from "@/utils/local-storage-utils";


export const useUserStore = defineStore("user", () => {
  const userInfo = ref(null);
  const isLoading = ref(false);

  const login = async (params: LoginParams) => {
    //console.log('LoginParams', params)
    try {
      isLoading.value = true;
      //const res = await loginApi(params);
      userInfo.value = params;
      LocalStorageUtils.setItem("userToken", params)
      return Promise.resolve(params);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    userInfo,
    isLoading,
    login,
  };
});
