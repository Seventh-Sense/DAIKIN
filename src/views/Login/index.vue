<template>
  <a-row class="login">
    <a-col :span="12">col-18 col-push-6</a-col>
    <a-col :span="12">
      <div class="login-box">
        <a-form
          :model="formState"
          name="normal_login"
          class="login-form"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
        >
          <a-form-item
            label="Username"
            name="username"
            :rules="[
              { required: true, message: 'Please input your username!' },
            ]"
          >
            <a-input v-model:value="formState.username">
              <template #prefix>
                <UserOutlined class="site-form-item-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            label="Password"
            name="password"
            :rules="[
              { required: true, message: 'Please input your password!' },
            ]"
          >
            <a-input-password v-model:value="formState.password">
              <template #prefix>
                <LockOutlined class="site-form-item-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-form-item name="remember" no-style>
              <a-checkbox v-model:checked="formState.remember"
                >Remember me</a-checkbox
              >
            </a-form-item>
            <a class="login-form-forgot" href="">Forgot password</a>
          </a-form-item>

          <a-form-item>
            <a-button
              :disabled="disabled"
              type="primary"
              html-type="submit"
              class="login-form-button"
            >
              Log in
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { loginApi } from "@/api";
import { reactive, computed } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
interface FormState {
  username: string;
  password: string;
  remember: boolean;
}
const formState = reactive<FormState>({
  username: "",
  password: "",
  remember: true,
});
const onFinish = (values: any) => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};
const disabled = computed(() => {
  return !(formState.username && formState.password);
});
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
}

</style>
