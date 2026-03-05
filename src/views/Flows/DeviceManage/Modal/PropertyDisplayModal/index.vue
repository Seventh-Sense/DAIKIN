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
        class="modal-content-item"
      >
        <!-- <div v-if="key === 'priority-array'" class="modal-content-collapse">
          <a-collapse>
            <a-collapse-panel :header="t('device.priority_array')" key="1">
              <div
                v-for="(value, key) in val"
                :key="key"
                class="modal-content-collapse-item"
              >
                <span>{{ key }}</span>
                <span>{{ value }}</span>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
        <div v-else>
          <span class="modal-content-porperty">
            {{ PROPERTY_TYPE_MAP(key) }}
          </span>
          <div v-if="key === 'object-type'" class="modal-content-value">
            {{ getDeviceTypeName(val) }}
          </div>
          <div
            v-else-if="key === 'object-identifier'"
            class="modal-content-value"
          >
            {{ objIDTrans(val) }}
          </div>
          <div
            v-else-if="key === 'description'"
            class="modal-content-editstyle"
          >
            <div v-if="!editStates[key]" class="modal-content-editvalue">
              <span>{{ val }}</span>
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => enterEditMode(key)"
              >
                <EditIcon />
              </n-icon>
            </div>
            <div v-else class="modal-content-editvalue">
              <n-input
                v-model:value="tempValues[key]"
                type="text"
                :style="{ width: '600px' }"
              />
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => handleSave(key)"
              >
                <CheckmarkIcon />
              </n-icon>
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => cancelEdit(key)"
              >
                <CloseIcon />
              </n-icon>
            </div>
          </div>
          <div v-else-if="key === 'units'" class="modal-content-value">
            {{ unitsTrans(val) }}
          </div>
          <div
            v-else-if="key === 'present-value'"
            class="modal-content-editstyle"
          >
            <div v-if="!editStates[key]" class="modal-content-editvalue">
              <span>{{
                presentValueTrans(val, type, BinaryOption, MVOption)
              }}</span>
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => enterEditMode(key)"
              >
                <EditIcon />
              </n-icon>
            </div>
            <div v-else class="modal-content-editvalue">
              <n-select
                v-if="
                  BinaryOption.length > 0 &&
                  (type === TypeEnum.BI ||
                    type === TypeEnum.BV ||
                    type === TypeEnum.BO)
                "
                v-model:value="tempValues[key]"
                :options="BinaryOption"
                :style="{ width: '300px' }"
              />
              <n-select
                v-else-if="MVOption.length > 0 && type === TypeEnum.MV"
                v-model:value="tempValues[key]"
                :options="MVOption"
                :style="{ width: '300px' }"
              />
              <n-input-number
                v-else
                v-model:value="tempValues[key]"
                style="width: 300px"
              />
              <n-select
                :placeholder="t('device.priority')"
                v-model:value="priority"
                :options="PriorityOption"
                :style="{ width: '300px' }"
                :disabled="!isPriority(type)"
              />
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => handleSave(key)"
              >
                <CheckmarkIcon />
              </n-icon>
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => cancelEdit(key)"
              >
                <CloseIcon />
              </n-icon>
            </div>
          </div>
          <div
            v-else-if="key === 'out-of-service'"
            class="modal-content-editstyle"
          >
            <div v-if="!editStates[key]" class="modal-content-editvalue">
              <span>{{ val === 0 ? "False" : "True" }}</span>
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => enterEditMode(key)"
              >
                <EditIcon />
              </n-icon>
            </div>
            <div v-else class="modal-content-editvalue">
              <n-select
                v-model:value="tempValues[key]"
                :options="BooleanOption"
                :style="{ width: '600px' }"
              />
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => handleSave(key)"
              >
                <CheckmarkIcon />
              </n-icon>
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => cancelEdit(key)"
              >
                <CloseIcon />
              </n-icon>
            </div>
          </div>
          <div v-else-if="key === 'status-flags'" class="modal-content-value">
            {{ val instanceof Array ? val.join("") : val }}
          </div>
          <div
            v-else-if="key === 'relinquish-default'"
            class="modal-content-editstyle"
          >
            <div v-if="!editStates[key]" class="modal-content-editvalue">
              <span>{{
                presentValueTrans(val, type, BinaryOption, MVOption)
              }}</span>
              <n-icon
                v-show="val !== 'unknown-property'"
                size="20"
                class="go-cursor-pointer"
                @click="() => enterEditMode(key)"
              >
                <EditIcon />
              </n-icon>
            </div>
            <div v-else class="modal-content-editvalue">
              <n-select
                v-if="
                  BinaryOption.length > 0 &&
                  (type === TypeEnum.BI ||
                    type === TypeEnum.BV ||
                    type === TypeEnum.BO)
                "
                v-model:value="tempValues[key]"
                :options="BinaryOption"
                :style="{ width: '600px' }"
              />
              <n-select
                v-else-if="MVOption.length > 0 && type === TypeEnum.MV"
                v-model:value="tempValues[key]"
                :options="MVOption"
                :style="{ width: '600px' }"
              />
              <n-input-number
                v-else
                v-model:value="tempValues[key]"
                style="width: 600px"
              />
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => handleSave(key)"
              >
                <CheckmarkIcon />
              </n-icon>
              <n-icon
                size="20"
                class="go-cursor-pointer"
                @click="() => cancelEdit(key)"
              >
                <CloseIcon />
              </n-icon>
            </div>
          </div>
          <div v-else class="modal-content-value">
            {{ val }}
          </div>
        </div> -->
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";

interface EditState {
  [key: string]: boolean;
}

const { t } = useI18n();

const emit = defineEmits(["update:modelShow"]);

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

onMounted(() => {
  console.log("bacnetData", props.bacnetData);
  console.log("deviceData", props.deviceData);
});

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
};

const handleOk = () => {};
</script>

<style lang="less" scoped>
.modal {
}
</style>
