import { defineStore } from "pinia";
import { ref } from "vue";

export const useStepStore = defineStore("step", () => {
  const currentStep = ref<number>(1);

  const updateCurrentStep = (step: number) => {
    if (step >= 1 && step <= 6) {
      currentStep.value = step;
    }
  };

  const resetStep = () => {
    currentStep.value = 1;
  };

  return {
    currentStep,
    updateCurrentStep,
  };
});
