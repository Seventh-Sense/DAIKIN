<template>
  <a-layout class="layout">
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
      class="layout-sider"
    >
      <LayoutSider />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="layout-header">
        <LayoutHeader />
      </a-layout-header>
      <a-layout-content :style="{ margin: '24px 16px 0' }">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import LayoutHeader from "@/views/Home/LayoutHeader/index.vue";
import LayoutSider from "@/views/Home/LayoutSider/index.vue";

const onCollapse = (collapsed: boolean, type: string) => {
  console.log(collapsed, type);
};

const onBreakpoint = (broken: boolean) => {
  console.log(broken);
};
</script>

<style lang="less" scoped>
@sider-w: 234px;

.layout {
  height: 100%;

  &-sider {
    background-color: var(--sidebar-bg);
    width: @sider-w !important;
    max-width: @sider-w !important;
    min-width: @sider-w !important;
  }

  &-header {
    background-color: var(--header-bg);
    height: 80px;
    border-left: 1px solid var(--sider-menu-border-color);
  }
}
</style>
