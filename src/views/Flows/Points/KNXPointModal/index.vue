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
        <div class="modal-porperty">{{ KNX_ID_MAP(String(key)) }}</div>
        <div
          v-if="
            key === 'name' ||
            key === 'description' ||
            key === 'read_address' ||
            key === 'write_address' ||
            key === 'tags'
          "
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
            <a-input v-model:value="data[key]" />
          </div>
        </div>
        <div v-else-if="key === 'value_type'">
          <div v-if="isEdit">
            <div v-if="!editStates[key]" class="modal-editstyle">
              <span>{{ valueTypeTrans(val) }}</span>
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
                :options="KNXValueTypeOptions"
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
              :options="KNXValueTypeOptions"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
      <div v-if="isEdit">
        <div class="modal-porperty">{{ $t("device_manage.value") }}</div>
        <div v-if="!editStates['vvalue']" class="modal-editstyle">
          <span>{{ valueTrans(value) }}</span>
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
            v-if="data.value_type === 'percent'"
            v-model:value="tempValues['vvalue']"
            :min="0"
            :max="100"
            style="width: 100%"
          />
          <a-select
            v-else
            v-model:value="tempValues['vvalue']"
            :options="BooleanOption"
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
import { inject, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";
import { KNXValueTypeOptions } from "../../DeviceManage/utils/options";
import { createModbusPoint, readIotPoints, updateIotPoints } from "@/api";
import { message } from "ant-design-vue";

interface EditState {
  [key: string]: boolean;
}

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

const { t } = useI18n();

const data = ref<{
  name: string;
  description: string;
  read_address: string;
  write_address: string;
  value_type: string;
  tags: string;
  [key: string]: any;
}>({
  name: "",
  description: "",
  read_address: "0/1/1",
  write_address: "0/0/1",
  value_type: "bool",
  tags: "",
});

const KNX_ID_MAP = (key: string) => {
  const ID_MAP: { [key: string]: string } = {
    name: t("device_manage.name"),
    description: t("device_manage.desc"),
    read_address: t("device_manage.read_address"),
    write_address: t("device_manage.write_address"),
    value_type: t("device_manage.value_type"),
    tags: t("device_manage.tags"),
    value: t("device_manage.value"),
  };

  return ID_MAP[key] ? ID_MAP[key] : key;
};

const editStates = reactive<EditState>({});
const tempValues = reactive<Record<string, any>>({});

const value = ref<any>();

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

  let load: any;

  if (data.value.value_type === "bool") {
    load = tempValues[key] === "true" ? true : false;
  } else {
    load = tempValues[key];
  }

  //console.log('Writing value:', tempValues[key])
  try {
    const res: any = await readIotPoints(deviceInfo.value.key, {
      function: "write",
      parms: {
        address: data.value.write_address,
        value_type: data.value.value_type,
        value: load,
      },
    });

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.data);
      message.error(t("msg.msg_write_failed"));
      return;
    }

    message.success(t("msg.msg_write_success"));

    value.value = tempValues[key];
    editStates[key] = false;
  } catch (e) {
    console.error("onSubmit:", e);
    message.error(t("msg.msg_write_failed"));
  }
};

const handleSaveCommon = async (key: any) => {
  let load = {};

  if (
    (key === "name" && tempValues[key] === "") ||
    (key === "read_address" && tempValues[key] === "") ||
    (key === "write_address" && tempValues[key] === "")
  ) {
    message.warn(t("msg.msg_enter_required_params"));
    return;
  }

  if (["name", "description", "tags"].includes(key)) {
    load = { [key]: tempValues[key] };
  } else if (["read_address", "write_address", "value_type"].includes(key)) {
    load = {
      property: {
        read_address:
          key === "read_address" ? tempValues[key] : data.value.read_address,
        write_address:
          key === "write_address" ? tempValues[key] : data.value.write_address,
        value_type:
          key === "value_type" ? tempValues[key] : data.value.value_type,
      },
    };
  }

  //console.log('Saving data:', key, load)
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

const dataCheck = (data: any) => {
  let flag = false;

  //console.log(data)
  if (
    data.name === "" ||
    data.read_address === "" ||
    data.write_address === ""
  ) {
    message.warn(t("msg.msg_enter_required_params"));
    return true;
  }

  return flag;
};

const addNewPoint = async () => {
  try {
    const res: any = await createModbusPoint({
      uid: data.value.read_address + "|" + data.value.write_address,
      name: data.value.name,
      property: {
        read_address: data.value.read_address,
        write_address: data.value.write_address,
        value_type: data.value.value_type,
      },
      tags: data.value.tags,
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

const handleOk = () => {
  if (!props.isEdit) {
    if (!dataCheck(data.value)) {
      addNewPoint();
    }
  }
};

const valueTypeTrans = (value: any) => {
  const Options = [
    {
      label: t("device_manage.bool"),
      value: "bool",
    },
    {
      label: t("device_manage.percent"),
      value: "percent",
    },
  ];

  const option = Options.find((opt) => opt.value === value);
  return option?.label || value; // 严格遵循找不到返回空字符串
};

const BooleanOption = [
  { label: "true", value: "true" },
  { label: "false", value: "false" },
];

const valueTrans = (value: any) => {
  if (data.value.value_type !== "bool") {
    return value;
  }

  const option = BooleanOption.find((opt) => opt.value === value);

  return option?.label || value; // 严格遵循找不到返回空字符串
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
        read_address: props.editData.properties.read_address,
        write_address: props.editData.properties.write_address,
        value_type: props.editData.properties.value_type,
        tags: props.editData.tags,
      };

      if (props.editData.value) {
        if (props.editData.properties.value_type === "bool") {
          value.value = props.editData.value;
        } else {
          value.value = Number(props.editData.value);
        }
      }

      //console.log('asda', props.editData, value.value)
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
