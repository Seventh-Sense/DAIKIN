<template>
  <div class="header">
    <div class="header-left">
      <ProgressDisplay/>
    </div>
    <div class="header-right">
      <LangSelect />
      <AvatarShow />
    </div>
  </div>
</template>

<script setup lang="ts">
import LangSelect from "@/components/LangSelect/index.vue";
import AvatarShow from "@/components/AvatarShow/index.vue";
import ProgressDisplay from "@/components/ProgressDisplay/index.vue";
import { useRoute } from "vue-router";
import { onMounted } from "vue";

const route = useRoute();


onMounted(() => {
  //console.log('route.params', route)
})
</script>

<style lang="less" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  height: 80px;

  &-left {
    display: flex;
    align-items: center;
  }

  &-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
  }
}
</style>
