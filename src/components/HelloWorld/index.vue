<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LangSelect from '@/components/LangSelect/index.vue'
import ThemeSelect from '@/components/ThemeSelect/index.vue'
import { loginApi } from '@/api';
const count = ref(0)


onMounted(async() => {
  try{

    const res = await loginApi({})

    console.log('res',res)

  } catch (e) {
    console.log(e)
  }
})
</script>

<template>
  <svg-icon name="logo" :size="80"></svg-icon>
  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit  {{ $t('user.confirmDelete') }}
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <LangSelect/>
  <ThemeSelect/>
  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped lang="less">
.read-the-docs {
  color: var(--sidebar-bg);
}
</style>
