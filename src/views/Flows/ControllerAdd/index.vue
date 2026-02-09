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
import { routerTurnByName, routerTurnByPath } from "../../../router/util";
import { findNextMenu } from "../until.ts/util";

const stepStore = useStepStore();

// {
//     "key": "1-17706009069147a695-1",
//     "icon": "informationCircle",
//     "labelKey": "layout.flow_1",
//     "path": "/home/controller",
//     "data": {
//         "address": "192.168.1.1"
//     },
//     "label": "デバイス情報"
// }
onMounted(() => {
  console.log(stepStore.currentMenuData)
})

const onClick = () => {
  let nextMenu: any = findNextMenu(stepStore.currentStep, stepStore.currentMenuData)
  //改变selectkey
  stepStore.updateMenuSelectedKeys([nextMenu.key])
  stepStore.updateCurrentStep(nextMenu.key)
  routerTurnByPath(nextMenu.path)
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
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;
  }
}
</style>
