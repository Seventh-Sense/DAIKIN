<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="
      props.isEdit
        ? t('device_manage.edit_point')
        : t('device_manage.add_point')
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
        v-for="(val, key, index) in data"
        :key="key"
        style="margin-top: 12px"
      >
        <div class="modal-property">{{ MODBUS_ID_MAP(String(key)) }}</div>
        <div
          v-if="key === 'name' || key === 'description' || key === 'address'"
        >
          <div v-if="isEdit">
            <div v-if="!editStates[key]" class="modal-editstyle">
              <span>{{ val }}</span>
              <Icons
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
          <div v-else>
            <a-input
              v-model:value="data[key]"
              :placeholder="
                key === 'address'
                  ? t('device_manage.modbus_tip_enter')
                  : key === 'name'
                    ? t('device_manage.please_enter_name')
                    : ''
              "
            />
          </div>
        </div>
        <div
          v-else-if="
            key === 'function' ||
            key === 'data_type' ||
            key === 'byteorder' ||
            key === 'wordorder'
          "
        >
          <div v-if="isEdit">
            <div v-if="!editStates[key]" class="modal-editstyle">
              <span v-if="key === 'wordorder' || key === 'byteorder'">
                {{ orderTrans(val) }}
              </span>
              <span v-else>{{ modbusSelectTextMap(key, val) }}</span>
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
                :options="modbusSelectOptions(key)"
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
          <div v-else>
            <a-select
              v-model:value="data[key]"
              :options="modbusSelectOptions(key)"
              style="width: 100%"
            />
          </div>
        </div>
        <div v-else-if="key === 'count' || key === 'divisor'">
          <div v-if="isEdit">
            <div v-if="!editStates[key]" class="modal-editstyle">
              <span>{{ val }}</span>
              <Icons
                name="edit"
                type="mono-line"
                :size="20"
                :color="{ normal: '#222222FF' }"
                @click="enterEditMode(key)"
              />
            </div>
            <div v-else class="modal-editvalue">
              <a-input-number
                v-model:value="tempValues[key]"
                :min="0"
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
          <div v-else>
            <a-input-number
              v-model:value="data[key]"
              :min="0"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
      <div v-if="isWriteble">
        <div class="modal-porperty" style="margin-top: 12px">
          {{ $t("device_manage.value") }}
        </div>
        <div v-if="!editStates['vvalue']" class="modal-editstyle">
          <span>{{ value }}</span>
          <Icons
            name="edit"
            type="mono-line"
            :size="20"
            :color="{ normal: '#222222FF' }"
            @click="enterEditMode('vvalue')"
          />
        </div>
        <div v-else class="modal-editvalue">
          <a-input-number
            v-model:value="tempValues['vvalue']"
            :min="0"
            style="width: 100%"
          />
          <div class="icon-group">
            <Icons
              name="checkmark"
              type="mono-line"
              :size="20"
              :color="{ normal: '#222222FF' }"
              @click="handleSave('vvalue')"
            />
            <Icons
              name="dismissCircle"
              type="mono-line"
              :size="20"
              :color="{ normal: '#222222FF' }"
              @click="cancelEdit('vvalue')"
            />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash";
import { computed, inject, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";
import {
  modbusSelectOptions,
  modbusSelectTextMap,
  validateIntegerOrRange,
} from "../tool";
import { message } from "ant-design-vue";
import { createModbusPoint, readIotPoints, updateIotPoints } from "@/api";

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
  editData: {
    type: Object,
    required: true,
  },
});

const deviceInfo: any = inject("deviceInfo");

interface EditState {
  [key: string]: boolean;
}

const { t } = useI18n();

const data = ref<{
  [key: string]: any;
  name: string;
  description: string;
  function: string;
  address: string;
  count: number;
  data_type: string;
  byteorder: number;
  wordorder: number;
  divisor: number;
}>({
  name: "",
  description: "",
  function: "03",
  address: "",
  count: 1,
  data_type: "int16",
  byteorder: 1,
  wordorder: 1,
  divisor: 1,
});

const MODBUS_ID_MAP = (key: string) => {
  const ID_MAP: { [key: string]: string } = {
    name: t("device_manage.name"),
    description: t("device_manage.desc"),
    function: t("device_manage.reg_type"),
    address: t("device_manage.reg_attr"),
    count: t("device_manage.reg_num"),
    data_type: t("device_manage.data_type"),
    byteorder: t("device_manage.byte_order"),
    wordorder: t("device_manage.word_order"),
    divisor: t("device_manage.coefficient"),
  };

  return ID_MAP[key] ? ID_MAP[key] : key;
};

const value = ref();

const isWriteble = computed(() => {
  let flag = false;

  if (props.isEdit) {
    if (data.value.function === "01" || data.value.function === "03") {
      flag = true;
    }
  }

  return flag;
});

const editStates = reactive<EditState>({});
const tempValues = reactive<Record<string, any>>({});

const enterEditMode = (key: any) => {
  editStates[key] = true;

  if (key === "vvalue") {
    tempValues[key] = cloneDeep(value.value);
  } else {
    tempValues[key] = cloneDeep(data.value[key]);
  }
};

const handleSave = async (key: any) => {
  if (key === "vvalue") {
    writeValue(key);
  } else {
    handleSaveCommon(key);
  }
};

const cancelEdit = (key: any) => {
  editStates[key] = false;
};

const writeValue = async (key: any) => {
  if (
    tempValues[key] === "" ||
    tempValues[key] === null ||
    tempValues[key] === undefined
  ) {
    message.warn(t("msg.msg_enter_value_not_empty"));
    return;
  }

  //console.log('Writing value:', tempValues[key])
  const func = data.value.function === "03" ? "06" : "05";

  try {
    const res: any = await readIotPoints(deviceInfo.value.key, {
      function: func,
      parms: {
        address: Number(data.value.address),
        value: tempValues[key],
        data_type: data.value.data_type,
        byteorder: data.value.byteorder,
        wordorder: data.value.wordorder,
        divisor: data.value.divisor,
      },
    });

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.data);
      message.error(t("msg.msg_write_failed"));
      return;
    }

    value.value = tempValues[key];
    editStates[key] = false;

    message.success(t("msg.msg_write_success"));
  } catch (e) {
    console.error("onSubmit:", e);
    message.error(t("msg.msg_write_failed"));
  }
};

const handleSaveCommon = async (key: any) => {
  let load = {};

  if (
    (key === "name" && tempValues[key] === "") ||
    (key === "address" && tempValues[key] === "")
  ) {
    message.warn(t("msg.msg_enter_required_params"));
    return;
  }

  if (key === "address" && !validateIntegerOrRange(tempValues[key])) {
    message.warn(t("msg.msg_invalid_address_format"));
    return;
  }

  if (key === "name" || key === "description") {
    load = { [key]: tempValues[key] };
  } else {
    data.value[key] = tempValues[key];

    const propertyObj = {
      function: data.value.function,
      parms: getPropertyParams(),
    };

    load =
      key === "address"
        ? { uid: data.value.address, property: propertyObj }
        : { property: propertyObj };
  }

  //console.log("Saving data:", key, load);
  try {
    const res: any = await updateIotPoints(props.editData.key, load);

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.status);
      message.error(t("msg.msg_modify_failed"));
      return;
    }

    message.success(t("msg.msg_modify_success"));

    data.value[key] = tempValues[key];
    editStates[key] = false;
  } catch (error) {
    console.error("Error saving value:", error);
    message.error(t("msg.msg_modify_failed"));
  }
};

const orderTrans = (value: any) => {
  const OrderOptions = [
    {
      label: t("device_manage.little_endian"),
      value: 0,
    },
    {
      label: t("device_manage.big_endian"),
      value: 1,
    },
  ];

  const option = OrderOptions.find((opt) => opt.value === value);
  return option?.label || value; // 严格遵循找不到返回空字符串
};

const getPropertyParams = () => ({
  address: Number(data.value.address),
  count: data.value.count,
  data_type: data.value.data_type,
  byteorder: data.value.byteorder,
  wordorder: data.value.wordorder,
  divisor: data.value.divisor,
});

const dataCheck = (data: any) => {
  // 移除无用的flag变量，简化逻辑
  // 名称为空校验
  if (data.name === "") {
    message.warn(t("device.msg_name_cannot_empty"));
    return true;
  }

  // 寄存器数量为空校验
  if (data.count === null || data.count === "") {
    message.warn(t("device.msg_reg_count_cannot_empty"));
    return true;
  }

  // 除数为空校验
  if (data.divisor === null || data.divisor === "") {
    message.warn(t("device.msg_divisor_cannot_empty"));
    return true;
  }

  // 地址为空校验
  if (data.address === "") {
    message.warn(t("device.msg_address_cannot_empty"));
    return true;
  }

  // 地址格式校验
  if (!validateIntegerOrRange(data.address)) {
    message.warn(t("device.msg_invalid_address_format"));
    return true;
  }

  return false;
};

const addNewPoint = async () => {
  try {
    const res: any = await createModbusPoint({
      uid: data.value.address,
      name: data.value.name,
      property: {
        function: data.value.function,
        parms: {
          address: Number(data.value.address),
          count: data.value.count,
          data_type: data.value.data_type,
          byteorder: data.value.byteorder,
          wordorder: data.value.wordorder,
          divisor: data.value.divisor,
        },
      },
      tags: "",
      description: data.value.description,
      device_id: deviceInfo.value.key,
    });

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.status);
      message.warn(t("msg.msg_add_point_failed"));
      return;
    }

    message.success(t("msg.msg_add_point_success"));
    emit("onSaveSuccess");
  } catch (e) {
    console.error("onSubmit:", e);
    message.warn(t("msg.msg_add_point_failed"));
  } finally {
    emit("update:modelShow", false);
  }
};

const addNewPoints = async () => {
  try {
    const [startStr, endStr] = data.value.address.split("-");

    const startAddress = parseInt(startStr, 10);
    const endAddress = parseInt(endStr, 10);

    // 批量创建点位数据
    const pointCount = endAddress - startAddress + 1;

    const requests = Array.from({ length: pointCount }, (_, i) => {
      const currentAddress = startAddress + i;

      const pointData: any = {
        uid: currentAddress.toString(),
        name: `${data.value.name} ${currentAddress}`,
        property: {
          function: data.value.function,
          parms: {
            address: currentAddress,
            count: data.value.count,
            data_type: data.value.data_type,
            byteorder: data.value.byteorder,
            wordorder: data.value.wordorder,
            divisor: data.value.divisor,
          },
        },
        tags: "",
        description: data.value.description,
        device_id: deviceInfo.value.key,
      };

      return createModbusPoint(pointData);
    });

    const BATCH_SIZE = 100;
    const results: any[] = [];

    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(batch);
      results.push(...batchResults);
    }

    // 处理结果
    const successes: string[] = [];
    const failures: { uid: string; reason: string }[] = [];

    results.forEach((result) => {
      console.log("Batch result:", result);
      if (result.status === "fulfilled") {
        if (result.value.status === "OK") {
          successes.push(result.value.data.uid);
        } else {
          failures.push({
            uid: "unknown",
            reason: `HTTP ${result.value.status}`,
          });
        }
      } else {
        failures.push({
          uid: "unknown",
          reason: result.reason.message || "Network error",
        });
      }
    });

    message.success(t("msg.msg_add_point_success"));
    emit("onSaveSuccess");
  } catch (e) {
    console.error("onSubmit:", e);
    message.warn(t("msg.msg_add_point_failed"));
  } finally {
    emit("update:modelShow", false);
  }
};

const handleOk = () => {
  if (!props.isEdit) {
    if (!dataCheck(data.value)) {
      if (data.value.address.includes("-")) {
        addNewPoints();
      } else {
        addNewPoint();
      }
    }
  } else {
    emit("update:modelShow", false);
  }
};

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
};

watch(
  () => props.isEdit,
  (newVal) => {
    if (newVal) {
      data.value = {
        name: props.editData.metric_name,
        description: props.editData.description,
        function: props.editData.properties.function,
        address: props.editData.properties.parms.address.toString(),
        count: props.editData.properties.parms.count,
        data_type: props.editData.properties.parms.data_type,
        byteorder: props.editData.properties.parms.byteorder,
        wordorder: props.editData.properties.parms.wordorder,
        divisor: props.editData.properties.parms.divisor,
      };
      if (props.editData.value) {
        value.value = parseFloat(props.editData.value);
      }

      //console.log('asda', props.editData)
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 100%;
  padding: 10px 6px 0 6px;

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
}

.icon-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
