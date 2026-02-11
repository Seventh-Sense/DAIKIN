<template>
  <div class="topic">
    <div class="topic-header">
      <span class="topic-title">{{ cardName }}</span>

      <!-- 非编辑状态：显示编辑/删除图标 -->
      <div class="topic-actions" v-if="!isEditing">
        <Icons
          name="edit"
          type="mono-line"
          :size="24"
          :color="{ normal: '#222222FF' }"
          @click="enterEdit"
        />
        <a-popconfirm
          :title="t('mqtt.confirm_delete', { name: cardName })"
          @confirm="handleDelete"
        >
          <Icons
            name="delete"
            type="mono-line"
            :size="24"
            :color="{ normal: '#F76F83FF' }"
          />
        </a-popconfirm>
      </div>
      <div class="topic-edit-btns" v-else>
        <a-button @click="handleCancel" class="cancel-btn">
          {{ t("mqtt.cancel") }}
        </a-button>
        <a-button type="primary" @click="handleSave" class="save-btn">
          {{ t("mqtt.save") }}
        </a-button>
      </div>
    </div>
    <div class="topic-content">
      <div class="topic-item">
        <span class="topic-label">{{ t("mqtt.sub_topic") }}</span>
        <template v-if="isEditing">
          <a-input
            v-model:value="editSubTopic"
            class="topic-input"
            style="width: 400px"
          />
        </template>
        <span v-else class="topic-value">{{ subTopic }}</span>
      </div>
      <div class="topic-item">
        <span class="topic-label">{{ t("mqtt.pub_topic") }}</span>
        <template v-if="isEditing">
          <a-input
            v-model:value="editPubTopic"
            class="topic-input"
            style="width: 400px"
          />
        </template>
        <span v-else class="topic-value">{{ pubTopic }}</span>
      </div>
      <div class="topic-item">
        <span class="topic-label">{{ t("mqtt.interval") }}</span>
        <template v-if="isEditing">
          <a-input-number
            v-model:value="editInterval"
            :min="1"
            class="topic-input"
            style="width: 400px"
          />
        </template>
        <span v-else class="topic-value">{{ interval }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref } from "vue";
import Icons from "@/icons/index.vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";

const { t } = useI18n();

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits<{
  update: [newData: any];
  delete: [originData: any];
}>();

const isEditing = ref(false);
const editSubTopic = ref("");
const editPubTopic = ref("");
const editInterval = ref("");

const cardName = computed(() => props.data.name);
const subTopic = computed(() => props.data.sub_topic);
const pubTopic = computed(() => props.data.pub_topic);
const interval = computed(() => props.data.interval);

watch(
  () => props.data,
  (newData) => {
    editSubTopic.value = newData.sub_topic;
    editPubTopic.value = newData.pub_topic;
    editInterval.value = newData.interval.toString();
  },
  { immediate: true },
);

const enterEdit = () => {
  isEditing.value = true;
};

const handleSave = () => {
  if (!editSubTopic.value.trim()) {
    message.warn(t("mqtt.sub_topic_empty"));
    return;
  }

  if (!editPubTopic.value.trim()) {
    message.warn(t("mqtt.pub_topic_empty"));
    return;
  }

  if (!editInterval.value || Number(editInterval.value) < 1) {
    message.warn(t("mqtt.interval_invalid"));
    return;
  }

  const newData: any = {
    ...props.data,
    sub_topic: editSubTopic.value.trim(),
    pub_topic: editPubTopic.value.trim(),
    interval: editInterval.value,
  };

  emit("update", newData);

  isEditing.value = false;
};

const handleCancel = () => {
  editSubTopic.value = props.data.sub_topic;
  editPubTopic.value = props.data.pub_topic;
  editInterval.value = props.data.interval.toString();

  isEditing.value = false;
};

const handleDelete = () => {
  emit("delete", props.data);
};
</script>

<style lang="less" scoped>
.topic {
  height: 160px;
  width: 100%;
  background-color: var(--topic-card-bg-color);
  border-radius: 6px;
  padding: 0 6px;

  &-header {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-title {
    font-weight: bold;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: right;
    font-style: normal;
  }

  &-actions {
    display: flex;
    gap: 12px;
  }

  &-edit-btns {
    display: flex;
    gap: 12px;
  }

  &-item {
    height: 40px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-label {
    font-weight: 400;
    font-size: 14px;
    color: var(--header-text-color);
    line-height: 20px;
    text-align: left;
    font-style: normal;
  }

  &-value {
    font-weight: 400;
    font-size: 14px;
    color: var(--sider-text-color);
    line-height: 20px;
    text-align: right;
    font-style: normal;
  }
}

.save-btn {
  width: 56px;
  height: 32px;
  border-radius: 0;
  padding: 0;
}

.cancel-btn {
  width: 72px;
  height: 32px;
  border-radius: 0;
  color: var(--btn-bg-color);
  border-color: var(--btn-bg-color);
  background-color: transparent;
  padding: 0;
}

:deep(.topic-input) {
  background-color: transparent !important;
}

:deep(.ant-input-number) {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--header-text-color) !important;

  &:focus,
  &:hover,
  &.ant-input-number-focused {
    box-shadow: none !important;
    outline: none !important;
  }

  .ant-input-number-input {
    padding-left: 0;
  }
}
</style>
