<template>
  <a-drawer
    v-model:open="innerShow"
    :title="t('user.manage')"
    placement="right"
    width="50vw"
    :body-style="{ paddingTop: '0' }"
  >
    <!-- 内部业务内容 -->
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="t('user.center')">
        <UserInfo/>
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('user.title')" force-render> </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import UserInfo from '@/components/Modal/User/UserInfo/index.vue'
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible"]);

const activeKey = ref("1");


const innerShow = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

onMounted(() => {
  
});


</script>

<style lang="less" scoped>


</style>
