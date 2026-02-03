<template>
  <div class="header">
    <LangSelect/>
    <AvatarShow/>
  </div>
</template>

<script setup lang="ts">
import LangSelect from '@/components/LangSelect/index.vue'
import AvatarShow from '@/components/AvatarShow/index.vue'

</script>

<style lang="less" scoped>
.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  height: 64px;
}
</style>
