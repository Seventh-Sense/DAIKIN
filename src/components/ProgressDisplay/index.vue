<template>
  <div class="flows">
    <div v-for="(flow, index) in flows" class="flows-block" :key="index">
      <div
        class="flows-num"
        :class="{
          'flows-num-completed': index + 1 < currentStep,
          'flows-num-current': index + 1 === currentStep,
        }"
      >
        {{ flow.index }}
      </div>
      <div
        class="flows-text"
        :class="{
          'flows-text-completed': index + 1 < currentStep,
          'flows-text-current': index + 1 === currentStep,
        }"
      >
        {{ flow.label }}
      </div>
      <div
        class="flows-connect"
        :class="{
          'flows-num-completed': index + 1 < currentStep,
          'flows-num-current': index + 1 === currentStep,
        }"
        v-if="index < flows.length - 1"
      />
    </div>
  </div>
  <!-- <button
    class="next-step-btn"
    @click="handleNextStep"
    :disabled="currentStep >= flows.length"
  >
    下一步 (当前步骤：{{ currentStep }})
  </button> -->
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const currentStep = ref(1);

const flows = computed(() => [
  {
    index: 1,
    label: t("layout.flow_1"),
  },
  {
    index: 2,
    label: t("layout.flow_2"),
  },
  {
    index: 3,
    label: t("layout.flow_3"),
  },
  {
    index: 4,
    label: t("layout.flow_4"),
  },
  {
    index: 5,
    label: t("layout.flow_5"),
  },
  {
    index: 6,
    label: t("layout.flow_6"),
  },
]);

const handleNextStep = () => {
  if (currentStep.value < flows.value.length) {
    currentStep.value += 1;
  }
};
</script>

<style lang="less" scoped>
.flows {
  display: flex;
  align-items: center;
  gap: 12px;

  &-block {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &-num {
    border-radius: 50%;
    background-color: var(--header-progress-color);
    width: 27px;
    height: 27px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: var(--header-bg);
    line-height: 20px;
    font-style: normal;
    transition: background-color 0.3s ease;
  }

  &-text {
    font-weight: bold;
    font-size: 20px;
    color: var(--header-progress-color);
    line-height: 29px;
    text-align: left;
    font-style: normal;
    transition: color 0.3s ease;
  }

  &-connect {
    width: 24px;
    height: 2px;
    background-color: var(--header-progress-color);
  }
}

.flows-num-completed {
  background-color: var(--header-progress-completed-color);
}

.flows-num-current {
  background-color: var(--header-progress-current-color);
}

.flows-text-completed {
  color: var(--header-progress-completed-color);
}

.flows-text-current {
  color: var(--header-progress-current-color);
}
</style>
