<template>
  <div class="list">
    <div class="list-title">
      <span class="list-title-text">控制器列表</span>
      <a-button type="primary" class="list-btn">添加</a-button>
    </div>
    <div>

    </div>
    <div class="list-finish">
      <a-button type="primary" class="list-btn">编辑完成</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="less" scoped>
.list {
  background-color: var(--sidebar-bg);
  height: 100%;
  padding: 0 24px;

  &-title {
    height: 52px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-text {
      font-weight: bold;
      font-size: 14px;
      color: #222222;
      line-height: 20px;
      text-align: left;
      font-style: normal;
    }
  }

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
