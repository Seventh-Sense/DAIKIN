<template>
  <a-row class="login">
    <a-col :span="12">
      <div style="background-color: antiquewhite; height: 100vh">
        <a-input v-model:value="formState.username" size="large"></a-input>
      </div>
    </a-col>
    <a-col :span="12">
      <div class="login-box">
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
  userStore.login(values)

  //缓存用户信息
  routerTurnByName('Home', false, false)
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};
</script>

<style lang="less" scoped>
.login {
  height: 100vh;
  width: 100%;

  &-box {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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
