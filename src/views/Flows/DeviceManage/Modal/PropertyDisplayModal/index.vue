<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="
      props.isEdit ? t('device_manage.device_info') : t('device_manage.detail')
    "
    :width="800"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
    <div class="modal">
      <div
        v-for="([key, val], index) in sortedEntries"
        :key="key"
        style="margin-top: 12px"
      >
        <div v-if="key === 'priority-array'" class="modal-collapse">
          <a-collapse>
            <a-collapse-panel
              :header="t('device_manage.priority_array')"
              key="1"
            >
              <div
                v-for="(value, key) in val"
                :key="key"
                class="modal-collapse-item"
              >
                <span>{{ key }}</span>
                <span>{{ value }}</span>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
        <div v-else>
          <div class="modal-property">
            {{ PROPERTY_TYPE_MAP(key) }}
          </div>
          <div v-if="key === 'object-type'" class="modal-editstyle">
            {{ getDeviceTypeName(val) }}
          </div>
          <div v-else-if="key === 'object-identifier'" class="modal-editstyle">
            {{ objIDTrans(val) }}
          </div>
          <div v-else-if="key === 'description'">
            <div v-if="!editStates[key]" class="modal-editstyle">
              <span>{{ val }}</span>
              <Icons
                v-if="isEdit"
                name="edit"
                type="mono-line"
                :size="20"
                :color="{ normal: '#222222FF' }"
                @click="enterEditMode(key)"
              />
            </div>
            <div v-else class="modal-editvalue">
              <a-input
                v-model:value="tempValues[key]"
                type="text"
                :style="{ flex: 1, minWidth: '400px' }"
              />
              <div class="icon-group">
                <Icons
                  name="checkmark"
                  type="mono-line"
                  :size="20"
                  :color="{ normal: '#222222FF' }"
                  @click="handleSave(key)"
                />
                <Icons
                  name="dismissCircle"
                  type="mono-line"
                  :size="20"
                  :color="{ normal: '#222222FF' }"
                  @click="cancelEdit(key)"
                />
              </div>
            </div>
          </div>
          <div v-else-if="key === 'units'" class="modal-editstyle">
            {{ unitsTrans(val) }}
          </div>
          <div v-else-if="key === 'present-value'">
            <div v-if="!editStates[key]" class="modal-editstyle">
              <span>
                {{ presentValueTrans(val, type, BinaryOption, MVOption) }}
              </span>
              <Icons
                name="edit"
                type="mono-line"
                :size="20"
                :color="{ normal: '#222222FF' }"
                @click="enterEditMode(key)"
              />
            </div>
            <div v-else class="modal-editvalue">
              <a-select
                v-if="
                  BinaryOption.length > 0 &&
                  (type === TypeEnum.BI ||
                    type === TypeEnum.BV ||
                    type === TypeEnum.BO)
                "
                v-model:value="tempValues[key]"
                :options="BinaryOption"
                style="width: 100%"
              />
              <a-select
                v-else-if="MVOption.length > 0 && type === TypeEnum.MV"
                v-model:value="tempValues[key]"
                :options="MVOption"
                style="width: 100%"
              />
              <a-input-number
                v-else
                v-model:value="tempValues[key]"
                style="width: 300px"
                :style="{ flex: 1, minWidth: '400px' }"
              />
              <!-- <a-select
                  :placeholder="t('device_manage.priority')"
                  v-model:value="priority"
                  :options="PriorityOption"
                  :style="{ width: '300px' }"
                  :disabled="!isPriority(type)"
                /> -->

              <div class="icon-group">
                <Icons
                  name="checkmark"
                  type="mono-line"
                  :size="20"
                  :color="{ normal: '#222222FF' }"
                  @click="handleSave(key)"
                />
                <Icons
                  name="dismissCircle"
                  type="mono-line"
                  :size="20"
                  :color="{ normal: '#222222FF' }"
                  @click="cancelEdit(key)"
                />
              </div>
            </div>
          </div>
          <div v-else-if="key === 'out-of-service'">
            <div v-if="!editStates[key]" class="modal-editstyle">
              <span>{{ val === 0 ? "False" : "True" }}</span>
              <Icons
                name="edit"
                type="mono-line"
                :size="20"
                :color="{ normal: '#222222FF' }"
                @click="enterEditMode(key)"
              />
            </div>
            <div v-else class="modal-editvalue">
              <a-select
                v-model:value="tempValues[key]"
                :options="BooleanOption"
                style="width: 100%"
              />
              <div class="icon-group">
                <Icons
                  name="checkmark"
                  type="mono-line"
                  :size="20"
                  :color="{ normal: '#222222FF' }"
                  @click="handleSave(key)"
                />
                <Icons
                  name="dismissCircle"
                  type="mono-line"
                  :size="20"
                  :color="{ normal: '#222222FF' }"
                  @click="cancelEdit(key)"
                />
              </div>
            </div>
          </div>
          <div v-else-if="key === 'status-flags'" class="modal-editstyle">
            {{ val instanceof Array ? val.join("") : val }}
          </div>
          <div v-else-if="key === 'relinquish-default'">
            <div v-if="!editStates[key]" class="modal-editstyle">
              <span>
                {{ presentValueTrans(val, type, BinaryOption, MVOption) }}
              </span>
              <Icons
                v-show="val !== 'unknown-property'"
                name="edit"
                type="mono-line"
                :size="20"
                :color="{ normal: '#222222FF' }"
                @click="enterEditMode(key)"
              />
            </div>
            <div v-else class="modal-editvalue">
              <a-select
                v-if="
                  BinaryOption.length > 0 &&
                  (type === TypeEnum.BI ||
                    type === TypeEnum.BV ||
                    type === TypeEnum.BO)
                "
                v-model:value="tempValues[key]"
                :options="BinaryOption"
                style="width: 100%"
              />
              <a-select
                v-else-if="MVOption.length > 0 && type === TypeEnum.MV"
                v-model:value="tempValues[key]"
                :options="MVOption"
                style="width: 100%"
              />
              <a-input-number
                v-else
                v-model:value="tempValues[key]"
                :style="{ flex: 1, minWidth: '400px' }"
              />
              <div class="icon-group">
                <Icons
                  name="checkmark"
                  type="mono-line"
                  :size="20"
                  :color="{ normal: '#222222FF' }"
                  @click="handleSave(key)"
                />
                <Icons
                  name="dismissCircle"
                  type="mono-line"
                  :size="20"
                  :color="{ normal: '#222222FF' }"
                  @click="cancelEdit(key)"
                />
              </div>
            </div>
          </div>
          <div v-else class="modal-editstyle">
            {{ val }}
          </div>
        </div>
      </div>

      <SetPresentValueModal
        v-if="isShow"
        v-model:modelShow="isShow"
        :deviceData="deviceData"
        :displayData="bacnetData"
        :options="options"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  getDeviceTypeName,
  objIDTrans,
  presentValueTrans,
  TypeEnum,
  unitsTrans,
  isPriority,
} from "../../utils/utils";
import Icons from "@/icons/index.vue";
import { message } from "ant-design-vue";
import { PriorityOption, BooleanOption } from "../../utils/options";
import { readIotPoints, readMetricById } from "@/api";
import SetPresentValueModal from "../SetPresentValueModal/index.vue";

interface EditState {
  [key: string]: boolean;
}

const { t } = useI18n();

const emit = defineEmits(["update:modelShow", "onSaveSuccess"]);

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    required: true,
  },
  bacnetData: {
    type: Object,
    required: true,
  },
  deviceData: {
    type: Object,
    required: true,
  },
});

const defaultPriority = [
  "object-name",
  "object-type",
  "object-identifier",
  "description",
];

const PROPERTY_TYPE_MAP = (key: string) => {
  const PROPERTY_MAP: { [key: string]: string } = {
    "object-name": t("device_manage.name"),
    "object-type": t("device_manage.type"),
    "object-identifier": t("device_manage.id"),
    description: t("device_manage.desc"),
    "event-state": t("device_manage.event_state"),
    "out-of-service": t("device_manage.out_of_service"),
    "present-value": t("device_manage.present_value"),
    "status-flags": t("device_manage.status_flags"),
    units: t("device_manage.unit"),
    "priority-array": t("device_manage.priority_array"),
    "relinquish-default": t("device_manage.relinquish_default"),
    "current-command-priority": t("device_manage.current_command_priority"),
    polarity: t("device_manage.polarity"),
    "alarm-values": t("device_manage.alarm_values"),
    "number-of-states": t("device_manage.number_of_states"),
    "state-text": t("device_manage.state_text"),
    priority: t("device_manage.priority"),
    "inactive-text": t("device_manage.inactive_text"),
    "active-text": t("device_manage.active_text"),
    "apdu-segment-timeout": t("device_manage.apdu_segment_timeout"),
    "apdu-timeout": t("device_manage.apdu_timeout"),
    "application-software-version": t(
      "device_manage.application_software_version",
    ),
    "database-revision": t("device_manage.database_revision"),
    "firmware-revision": t("device_manage.firmware_revision"),
    "max-apdu-length-accepted": t("device_manage.max_apdu_length_accepted"),
    "model-name": t("device_manage.model_name"),
    "number-of-apdu-retries": t("device_manage.number_of_apdu_retries"),
    "protocol-revision": t("device_manage.protocol_revision"),
    "protocol-version": t("device_manage.protocol_version"),
    "segmentation-supported": t("device_manage.segmentation_supported"),
    "system-status": t("device_manage.system_status"),
    "vendor-identifier": t("device_manage.vendor_identifier"),
    "vendor-name": t("device_manage.vendor_name"),
  };

  return PROPERTY_MAP[key] ? PROPERTY_MAP[key] : key;
};

const obj = ref(props.bacnetData.properties);

const sortedEntries = computed(() => {
  // 处理优先级属性（带类型校验）
  const priorityEntries = defaultPriority
    .filter((key) => obj.value[key] !== undefined)
    .map((key) => [key.toString(), obj.value[key]]);

  // 处理其他属性（保持原始顺序）
  const otherEntries = Object.entries(obj.value).filter(
    ([key]) => !defaultPriority.includes(key),
  );

  return [...priorityEntries, ...otherEntries];
});

const editStates = reactive<EditState>({});
const tempValues = reactive<Record<string, any>>({});

const isShow = ref(false);

const priority = ref(null);
const options = ref([]);

const type = ref(props.bacnetData.metric_type);
const BinaryOption = ref<any>([]);
const MVOption = ref<any>([]);

let interval: any = null;

onMounted(() => {
  console.log("bacnetData", props.bacnetData);
  console.log("deviceData", props.deviceData);
  initializeStates();

  interval = setInterval(() => {
    //console.log('check edit state...', type.value, props.displayData)
    if (
      type.value &&
      !isShow.value &&
      Object.values(editStates).every((value) => value === false)
    ) {
      updateInfo();
    }
  }, 3000);
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});

const enterEditMode = (key: string) => {
  if (key === "present-value" && isPriority(type.value)) {
    if (
      type.value === TypeEnum.BI ||
      type.value === TypeEnum.BV ||
      type.value === TypeEnum.BO
    ) {
      options.value = BinaryOption.value;
    } else if (type.value === TypeEnum.MV) {
      options.value = MVOption.value;
    }
    isShow.value = true;
  } else {
    editStates[key] = true;
    tempValues[key] = sortedEntries.value.find(([k]) => k === key)?.[1];
  }
};

const handleSave = async (key: string) => {
  try {
    let load = {
      function: "write_property",
      parms: {
        address: props.deviceData.address,
        objid: props.bacnetData.metric_uid,
        prop: key,
        value: tempValues[key],
      },
    };

    console.log(props.bacnetData);

    const res: any = await readIotPoints(props.deviceData.key, load);

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.status);
      if (res.data === "Error property: write-access-denied") {
        message.warn(t("msg.writeAccessDenied"));
      } else {
        message.warn(t("msg.modifyFailed"));
      }
      return;
    }

    message.success(t("msg.modifySuccess"));

    // 更新 sortedEntries 的值
    obj.value = {
      ...obj.value,
      [key]: tempValues[key], // 更新值
    };

    editStates[key] = false;
  } catch (error) {
    console.error("Error saving value:", error);
    message.success(t("msg.modifyFailed"));
  }
};

const cancelEdit = (key: string) => {
  editStates[key] = false;
};

const initializeStates = () => {
  sortedEntries.value.forEach(([key, val]) => {
    if (!(key in editStates)) {
      editStates[key] = false;
      tempValues[key] = val;
    }
  });

  if (
    type.value === TypeEnum.BI ||
    type.value === TypeEnum.BV ||
    type.value === TypeEnum.BO
  ) {
    let on = obj.value["active-text"];
    let off = obj.value["inactive-text"];

    if (
      on === undefined ||
      off === undefined ||
      on === "unknown-property" ||
      off === "unknown-property"
    ) {
      BinaryOption.value = [];
    } else {
      BinaryOption.value = [
        {
          label: obj.value["inactive-text"],
          value: 0,
        },
        {
          label: obj.value["active-text"],
          value: 1,
        },
      ];
    }
  } else if (type.value === TypeEnum.MV) {
    let array = obj.value["state-text"];

    if (!Array.isArray(array) || array.length === 0) {
      MVOption.value = [];
    } else {
      array.forEach((item: any, index: number) => {
        MVOption.value.push({
          label: item,
          value: index + 1,
        });
      });
    }
  }
};

const updateInfo = async () => {
  try {
    const res: any = await readMetricById(props.bacnetData.key);

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.status);
      return;
    }

    if (
      Array.isArray(res.data) &&
      res.data.length === 1 &&
      res.data[0].property &&
      res.data[0].property["object-name"]
    ) {
      obj.value = res.data[0].property;
      props.bacnetData.properties = res.data[0].property;
      //console.log('sadasd', res.data[0].property['present-value'])
    }
  } catch (error) {
    console.error("Error saving value:", error);
  }
};

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
};

const handleOk = () => {
  emit("update:modelShow", false);
};
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 100%;
  padding: 10px 6px 0 6px;
  max-height: 600px;
  overflow-y: auto;

  &-property {
    margin-bottom: 4px;
  }

  &-editstyle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: solid 1px var(--mask-color);
    height: 34px;
  }

  &-editvalue {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    height: 34px;
  }

  &-collapse {
    min-height: 32px;

    &-item {
      height: 32px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 32px;
    }
  }
}

.icon-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.ant-collapse-header) {
  height: 34px;
  align-items: center !important;
  padding: 0 !important;
  background-color: var(--header-bg);
}

:deep(.ant-collapse) {
  border: none !important;
}

:deep(.ant-collapse-item) {
  border: none !important;
}

:deep(.ant-collapse-item-active) {
  border: none !important;
}

:deep(.ant-collapse-content) {
  border: none !important;
}
</style>
