<template>
  <div class="flows" v-if="shouldShowFlows">
    <div v-for="(flow, index) in currentFlows" class="flows-block" :key="index">
      <div class="flows-num" :class="getStepStatusClass(Number(index), 'num')">
        {{ Number(index) + 1 }}
      </div>
      <div
        class="flows-text"
        :class="getStepStatusClass(Number(index), 'text')"
      >
        {{ t(flow.labelKey) }}
      </div>
      <div
        class="flows-connect"
        :class="getStepStatusClass(Number(index), 'num')"
        v-if="Number(index) < currentFlows.length - 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useStepStore } from "@/pinia/modules/step";
import {
  FlowPro,
  FlowStandard,
  FlowLite,
} from "../Modal/ControllersSearch/optons";

const { t } = useI18n();
const stepStore = useStepStore();

const parseCurrentKey = computed(() => {
  const key = stepStore.currentStep || "";
  const parts = key.split("-");

  return {
    stepNumber: Number(parts[2] || 0), // 当前步骤数字
    flowType: parts[0] || "", // 流程类型
    separatorCount: parts.length - 1, // 分隔符数量
  };
});

const currentStep = computed(() => parseCurrentKey.value.stepNumber);

const flowType = computed(() => parseCurrentKey.value.flowType);

const shouldShowFlows = computed(
  () => parseCurrentKey.value.separatorCount === 2,
);

const currentFlows = computed(() => {
  const flowMap: any = {
    "1": FlowPro,
    "2": FlowStandard,
    "3": FlowLite,
  };
  return flowMap[flowType.value] || FlowPro;
});

const getStepStatusClass = (index: number, type: "num" | "text"): string => {
  // 明确step是number类型
  const step: number = index + 1;
  const current: number = currentStep.value;

  const baseClass = `flows-${type}`;

  if (step < current) {
    return `${baseClass}-completed`;
  }
  if (step === current) {
    return `${baseClass}-current`;
  }
  return "";
};
</script>

<style lang="less" scoped>
.flows {
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    display: none;
  }

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
