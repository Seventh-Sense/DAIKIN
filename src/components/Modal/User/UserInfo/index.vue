<template>
  <div class="user">
    <div class="user-circle"></div>
    <div class="user-name">
      <span class="property username">{{ userInfo.username }}</span>
      <span class="property full-name">{{ userInfo.full_name }}</span>
    </div>
  </div>
  <div class="title">{{ $t("user.basic_info") }}</div>
  <div style="padding-left: 20px">
    <a-row :gutter="32">
      <a-col :span="12">
        <div class="block">
          <span class="property name">{{ $t("user.name") }}</span>
          <span class="property value">{{ userInfo.username }}</span>
        </div>

        <div class="block" style="margin-top: 100px">
          <span class="property name">{{ $t("user.email") }}</span>
          <span class="property value">{{ userInfo.email }}</span>
        </div>

        <div class="block" style="margin-top: 100px">
          <span class="property name">{{ $t("user.update_time") }}</span>
          <span class="property value">{{ userInfo.updated_at }}</span>
        </div>
      </a-col>

      <a-col :span="12">
        <div class="block">
          <span class="property name">{{ $t("user.full_name") }}</span>
          <span class="property value">{{ userInfo.full_name }}</span>
        </div>

        <div class="block" style="margin-top: 100px">
          <span class="property name">{{ $t("user.create_time") }}</span>
          <span class="property value">{{ userInfo.created_at }}</span>
        </div>
      </a-col>
    </a-row>
  </div>
  <div class="title" style="margin-top: 100px">{{ $t("user.password") }}</div>
  <div class="password">
    <div v-if="!isMod" style="height: 40px; display: flex; align-items: center">
      <span class="password-text">*****</span>
      <span class="password-btn" @click="onClick">{{ $t("user.modify") }}</span>
    </div>
    <div
      v-else
      style="display: flex; align-items: center; height: 40px; gap: 12px"
    >
      <a-input-password v-model:value="value" style="width: 300px" />
      <Icons
        name="checkmark"
        type="mono-line"
        :size="20"
        :color="{ normal: '#222222FF' }"
        @click="handleSave()"
      />
      <Icons
        name="dismissCircle"
        type="mono-line"
        :size="20"
        :color="{ normal: '#222222FF' }"
        @click="cancelEdit()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Icons from "@/icons/index.vue";
import { updateUserInfo, getUserInfo } from "@/api";

interface UserInfo {
  email: string;
  username: string;
  full_name: string;
  id: number;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string | null;
  updated_at: string | null;
}

const isMod = ref(false);

const value = ref("");

const userInfo = ref<UserInfo>({
  email: "",
  username: "",
  full_name: "",
  id: 0,
  is_active: false,
  is_superuser: false,
  created_at: null,
  updated_at: null,
});

onMounted(() => {
  //读取个人信息
  readUserInfo();
});

const readUserInfo = async () => {
  try {
    const result = await getUserInfo();

    userInfo.value = result;

    //console.log("获取用户信息成功：", result);
  } catch (e) {
    console.error("获取用户信息失败：", e);
  }
};

const onClick = () => {
  isMod.value = true;
};

const handleSave = async () => {
  try {
    const result = await updateUserInfo(userInfo.value.id, {
      email: userInfo.value.email,
      username: userInfo.value.username,
      full_name: userInfo.value.full_name,
      password: value.value,
    });

    if (result) {
      userInfo.value = result;
    }

    isMod.value = false;
  } catch (e) {
    console.log(e);
  }
};

const cancelEdit = () => {
  value.value = "";
  isMod.value = false;
};
</script>

<style lang="less" scoped>
.user {
  height: 100px;
  display: flex;
  align-items: center;
  gap: 20px;

  &-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background-color: var(--btn-bg-color);
  }

  &-name {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
  }
}

.title {
  height: 40px;
  width: 100%;
  background-color: var(--topic-card-bg-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding-left: 12px;
  font-weight: bold;
  font-size: 20px;
  color: var(--btn-bg-color);
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.block {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.property {
  font-weight: 400;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.username {
  font-size: 20px;
  color: var(--header-text-color);
}

.full-name {
  font-size: 18px;
  color: var(--sider-text-color);
}

.name {
  font-size: 18px;
  color: var(--sider-text-color);
}

.value {
  font-size: 24px;
  color: var(--header-text-color);
}

.password {
  padding-left: 20px;
  padding-top: 20px;
}

.password-text {
  padding-right: 20px;
  font-weight: 400;
  text-align: left;
  font-style: normal;
  text-transform: none;
  font-size: 24px;
  color: var(--header-text-color);
}

.password-btn {
  font-weight: 400;
  text-align: left;
  font-style: normal;
  text-transform: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--btn-bg-color);
}
</style>
