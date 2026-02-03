<template>
  <a-dropdown>
    <span class="avatar" @click.prevent>
      <FontAwesomeIcon icon="fa-user" size="lg" style="cursor: pointer" />
      {{ user }}</span
    >
    <template #overlay>
      <a-menu @click="handleClick">
        <a-menu-item key="1">
          {{ $t("layout.user") }}
        </a-menu-item>
        <a-menu-item key="2">
          {{ $t("layout.logout") }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { routerTurnByName } from "@/router/util";
import LocalStorageUtils from "@/utils/local-storage-utils";
import { onMounted, ref } from "vue";

const user = ref("");

onMounted(() => {
  let content: any = LocalStorageUtils.getItem("userToken");
  if (content !== null) {
    user.value = content.username;
  }
});

const handleClick = ({ key }: { key: string }) => {
  console.log(key, typeof key);
  switch (key) {
    case "1":
      break;
    case "2":
      LocalStorageUtils.removeItem("userToken");

      routerTurnByName("Login", true, false);
      break;
    default:
      break;
  }
};
</script>

<style lang="less" scoped>
.avatar {
  font-weight: bold;
  font-size: 14px;
  color: var(--header-text-color);
  line-height: 20px;
  text-align: center;
  font-style: normal;
}
</style>
