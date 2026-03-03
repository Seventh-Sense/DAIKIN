<template>
  <a-row class="login">
    <a-col :span="15" class="login-left">
      <img
        src="@/assets/login.png"
        alt="login background"
        class="login-bg-img"
      />
    </a-col>
    <a-col :span="9">
      <div class="login-box">
        <img src="@/assets/logo.png" alt="logo" class="logo-img" />
        <span class="login-box-title"> {{ t('login.manufacturer')}} </span>
        <span class="login-box-name"> {{ t('login.appname')}} </span>
        <a-form
          :model="formState"
          :rules="rules"
          name="normal_login"
          class="login-form"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
        >
          <a-form-item name="username">
            <a-input
              size="large"
              style="width: 400px"
              v-model:value="formState.username"
              :placeholder="t('login.username')"
            >
              <template #prefix>
                <UserOutlined class="site-form-item-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="password" class="login-form-password">
            <a-input-password
              size="large"
              v-model:value="formState.password"
              style="width: 400px"
              :placeholder="t('login.password')"
            >
              <template #prefix>
                <LockOutlined class="site-form-item-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item class="login-form-lang">
            <LangSelect />
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              class="login-form-button"
              :loading="userStore.isLoading"
            >
              {{ $t("login.loginBtn") }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import LangSelect from "@/components/LangSelect/index.vue";
import { useI18n } from "vue-i18n";
import { routerTurnByName } from "@/router/util";
import { useUserStore } from "@/pinia/modules/user";

const userStore = useUserStore();
const { t } = useI18n();
interface FormState {
  username: string;
  password: string;
}

const rules = computed(() => ({
  username: [{ required: true, message: t("login.placeholder.username") }],
  password: [{ required: true, message: t("login.placeholder.password") }],
}));

const formState = reactive<FormState>({
  username: "",
  password: "",
});

const onFinish = async (values: any) => {
  userStore.login(values);

  //缓存用户信息
  routerTurnByName("Home", false, false);
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};
</script>

<style lang="less" scoped>
.login {
  height: 100vh;
  width: 100%;

  &-left {
    height: 100%;
    padding: 0;
    overflow: hidden;
  }

  &-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &-box {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &-title {
      font-weight: bold;
      font-size: 48px;
      color: var(--header-text-color);
      line-height: 70px;
      text-align: center;
      font-style: normal;
      margin-bottom: 26px;
    }

    &-name {
      font-weight: bold;
      font-size: 20px;
      color: var(--header-text-color);
      line-height: 29px;
      text-align: center;
      font-style: normal;
      margin-bottom: 105px;
    }
  }

  &-img {
    width: 190px;
    height: 42px;
    margin-bottom: 14px;
  }

  &-form {
    &-password {
      margin-bottom: 12px;
    }
    &-lang {
      text-align: right;
      margin-bottom: 12px;
    }

    &-button {
      width: 400px;
      height: 40px;
    }
  }
}
</style>
