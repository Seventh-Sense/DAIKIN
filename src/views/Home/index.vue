<template>
  <a-layout class="layout">
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      v-model:collapsed="collapsed"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
      class="layout-sider"
      :width="234"
    >
      <LayoutSider />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="layout-header">
        <LayoutHeader />
      </a-layout-header>
      <a-layout-content>
        <router-view :key="$route.fullPath"></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import LayoutHeader from "@/views/Home/LayoutHeader/index.vue";
import LayoutSider from "@/views/Home/LayoutSider/index.vue";
import { ref } from "vue";
import { useRoute } from "vue-router";

const collapsed = ref(false);
const route = useRoute();

const onCollapse = (val: boolean, type: string) => {
  console.log(collapsed, type);
  collapsed.value = val;
};

const onBreakpoint = (broken: boolean) => {
  console.log(broken);
  // 当屏幕小于lg断点时，自动收缩侧边栏
  if (broken) {
    collapsed.value = true;
  } else {
    collapsed.value = false;
  }
};
</script>

<style lang="less" scoped>
@sider-w: 234px;

.layout {
  height: 100%;

  &-sider {
    background-color: var(--sidebar-bg);
    transition: all 0.2s ease;

    :deep(.ant-layout-sider-collapsed) {
      width: 0 !important;
      flex: 0 0 0;
      min-width: 0 !important;
    }
  }

  &-header {
    background-color: var(--header-bg);
    height: 80px;
    border-left: 1px solid var(--sider-menu-border-color);
    border-bottom: 1px solid var(--sider-menu-border-color);
  }
}
</style>
