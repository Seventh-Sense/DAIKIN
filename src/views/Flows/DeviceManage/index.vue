<template>
  <div class="card">
    <div class="card-content">
      <div v-if="iframeLoading" class="iframe-loading">
        {{ t("common.loading") }}...
      </div>
      <iframe
        ref="iframeRef"
        class="card-iframe"
        :src="iframeSrc"
        :name="iframeName"
        frameborder="0"
        scrolling="auto"
        @load="handleIframeLoad"
        @error="handleIframeError"
      ></iframe>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-finish-btn" @click="onClick">{{
        t("common.edit_complete")
      }}</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { handleEditCompleteJump } from "../until.ts/util";
import { useI18n } from "vue-i18n";
import { onMounted, ref } from "vue";

const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeSrc = ref<string>(""); // iframe 地址，默认空
const iframeName = ref<string>("content-iframe"); // iframe 名称
const iframeLoading = ref<boolean>(false); // iframe 加载状态
const iframeError = ref<boolean>(false); // iframe 加载错误状态

const { t } = useI18n();

onMounted(() => {
  setIframeSrc("http://127.0.0.1:9090/#/object/remote");
});

// 设置 iframe 地址并触发加载
const setIframeSrc = (src: string) => {
  iframeLoading.value = true;
  iframeError.value = false;
  iframeSrc.value = src;
};

// iframe 加载完成处理
const handleIframeLoad = () => {
  iframeLoading.value = false;
  console.log("iframe 加载完成");
  // 可在这里添加与 iframe 内部页面的通信逻辑
};

// iframe 加载错误处理
const handleIframeError = () => {
  iframeLoading.value = false;
  iframeError.value = true;
  console.error("iframe 加载失败");
};

const onClick = () => {
  handleEditCompleteJump();
};
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: calc(100vh - 80px);
  padding: 0 24px;
  display: flex;
  flex-direction: column;

  &-content {
    overflow: hidden;
    margin-bottom: 60px;
    flex: 1;
    position: relative;

    .iframe-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f5f5;
      z-index: 1;
    }
  }

  // iframe 样式
  &-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;

    &-btn {
      width: 74px;
      height: 32px;
      padding: 0;
      border-radius: 0;
    }
  }
}
</style>
