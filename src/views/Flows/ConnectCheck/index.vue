<template>
  <div class="card">
    <div class="card-finish">
      <a-button class="card-btn">逻辑控制</a-button>
      <a-button type="primary" class="card-btn">试运行结果</a-button>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: 100%;
  padding: 0 24px;

  &-btn {
    width: 86px;
    height: 32px;
    padding: 0;
    border-radius: 0;
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
