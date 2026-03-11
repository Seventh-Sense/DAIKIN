<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('device_manage.setCurrentValue')"
    :width="600"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
  >
    <template #footer> </template>
    <div class="modal">
      <div class="modal-name">
        {{ name }}
      </div>
      <div class="modal-porperty">
        {{ $t("device_manage.set_value") }}
      </div>
      <div class="modal-row">
        <div>
          <a-select
            v-if="
              type === TypeEnum.MV ||
              type === TypeEnum.BV ||
              type === TypeEnum.BO
            "
            v-model:value="value"
            :options="options"
            :style="{ width: '300px' }"
          />
          <a-input-number v-else v-model:value="value" style="width: 300px" />
        </div>
        <div class="modal-buttons">
          <a-button class="modal-buttons-1" @click="onRelease">
            {{ $t("device_manage.release") }}
          </a-button>
          <a-button type="primary" class="modal-buttons-2" @click="onSubmit">
            {{ $t("device_manage.compulsion") }}
          </a-button>
        </div>
      </div>

      <div v-if="isDisplay">
        <div class="modal-porperty">
          {{ $t("device_manage.priority") }}
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <a-select
            :placeholder="t('device_manage.priority')"
            v-model:value="priority"
            :options="PriorityOption"
            :style="{ width: '300px' }"
          />
          <a-button class="modal-buttons-1" @click="onReleaseALL">
            {{ $t("device_manage.release_all") }}
          </a-button>
        </div>
      </div>

      <div class="modal-advance" @click="onClick">
        {{ $t("device_manage.advance_option") }}

        <Icons
          v-if="isDisplay"
          name="arrowUp"
          type="mono-line"
          :size="28"
          :color="{ normal: '#222222FF' }"
        />

        <Icons
          v-else
          name="arrowDown"
          type="mono-line"
          :size="28"
          :color="{ normal: '#222222FF' }"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { isPriority, TypeEnum } from "../../utils/utils";
import { ref, watch } from "vue";
import { PriorityOption } from "../../utils/options";
import Icons from "@/icons/index.vue";
import { readIotPoints } from "@/api";
import { message } from "ant-design-vue";

const { t } = useI18n();

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  deviceData: {
    type: Object,
    required: true,
  },
  displayData: {
    type: Object,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelShow"]);

const type = ref(props.displayData.metric_type);

const name = ref("");
const value = ref<any>();
const priority = ref(null);

const isDisplay = ref(false);

const onClick = () => {
  isDisplay.value = !isDisplay.value;
};

const onSubmit = async () => {
  let load = {
    function: "write_property",
    parms: {
      address: props.deviceData.address,
      objid: props.displayData.metric_uid,
      prop: "present-value",
      value: value.value,
      ...(isPriority(type.value) &&
        priority.value !== null && { priority: priority.value }),
    },
  };

  sendOrder(load);
};

const onRelease = () => {
  if (priority.value === null) {
    message.warn(t("msg.msg_priority_cannot_empty"));
    return;
  }

  let load = {
    function: "write_property",
    parms: {
      address: props.deviceData.address,
      objid: props.displayData.metric_uid,
      prop: "present-value",
      value: null,
      priority: priority.value,
    },
  };

  sendOrder(load);
};

const onReleaseALL = async () => {
  const requests = Array.from({ length: 16 }, (_, i) => {
    const priority = i + 1; // 1-16
    return sendOrder(
      {
        function: "write_property",
        parms: {
          address: props.deviceData.address,
          objid: props.displayData.metric_uid,
          prop: "present-value",
          value: null,
          priority: priority,
        },
      },
      false,
    );
  });

  try {
    const results = await Promise.allSettled(requests);

    const successCount = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        (r as PromiseFulfilledResult<any>).value.status === "OK",
    ).length;

    const totalCount = results.length;

    if (successCount === totalCount) {
      message.success(t("msg.modifySuccess"));
    } else {
      message.success(t("msg.modifyFailed"));
    }
  } catch (error) {
    console.error("Batch release error:", error);
    message.success(t("msg.modifyFailed"));
  }
};

const sendOrder = async (load: any, flag: boolean = true) => {
  try {
    const res: any = await readIotPoints(props.deviceData.key, load);

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.status);
      if (flag) {
        if (res.data === "Error property: write-access-denied") {
          message.warn(t("msg.writeAccessDenied"));
        } else {
          message.warn(t("msg.modifyFailed"));
        }
      }
      return;
    }

    if (flag) {
      message.success(t("msg.modifySuccess"));
    }

    return res;
  } catch (error) {
    console.error("Error saving value:", error);
    message.success(t("msg.modifyFailed"));
  }
};

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
};

watch(
  () => props.modelShow,
  (newVal) => {
    if (newVal) {
      if (props.displayData && props.displayData.properties) {
        if (props.displayData.properties.hasOwnProperty("object-name")) {
          name.value = props.displayData.properties["object-name"];
        }

        if (props.displayData.properties.hasOwnProperty("present-value")) {
          value.value = props.displayData.properties["present-value"];
          //console.log('newVal', props.displayData.properties)
        }
      }
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 100%;
  padding: 10px 6px 0 6px;

  &-name {
    font-size: 24px;
    font-style: normal;
    text-transform: none;
    font-weight: bold;
  }

  &-porperty {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    margin-top: 12px;
    margin-bottom: 8px;
  }

  &-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  &-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }

  &-advance {
    font-size: 20px;
    font-style: normal;
    text-transform: none;
    font-weight: bold;
    margin-top: 20px;
    cursor: pointer;
  }
}
</style>
