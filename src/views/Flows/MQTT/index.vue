<template>
  <div class="card">
    <div class="card-finish">
      <a-button type="primary" class="card-btn">编辑完成</a-button>
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
    width: 74px;
    height: 32px;
    padding: 0;
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
  }
}
</style>
