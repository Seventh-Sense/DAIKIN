<template>
  <div class="card">
    <div class="card-finish">
      <a-button type="primary" class="card-btn" @click="onClick">编辑完成</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStepStore } from "@/pinia/modules/step";
import { onMounted } from "vue";
import { handleEditCompleteJump } from "../until.ts/util";

const stepStore = useStepStore();

onMounted(() => {
  console.log(stepStore.currentMenuData)
})

const onClick = () => {
  handleEditCompleteJump()
}
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: 100%;
  padding: 0 24px;

  &-btn {
    width: 74px;
    height: 32px;
    padding: 0;
    border-radius: 0;
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
  }
}
</style>
