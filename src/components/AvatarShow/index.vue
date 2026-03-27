<template>
  <div>
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
    <User v-if="show" v-model:visible="show"/>
  </div>
</template>

<script setup lang="ts">
import LocalStorageUtils from "@/utils/local-storage-utils";
import { onMounted, ref } from "vue";
import { useUserStore } from "@/pinia/modules/user";
import { routerTurnByName } from "@/router/util";
import User from "@/components/Modal/User/index.vue"

const userStore = useUserStore();
const user = ref("");

const show = ref(false)

onMounted(() => {
  let content: any = LocalStorageUtils.getItem("userToken");
  if (content !== null) {
    user.value = content.username;
  }
});

const handleClick = ({ key }: { key: string }) => {
  //console.log(key, typeof key);
  switch (key) {
    case "1":
      show.value = true
      break;
    case "2":
      userStore.logout();
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
