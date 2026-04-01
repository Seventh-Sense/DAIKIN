<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('user.add')"
    :width="500"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('device_search.ok')"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-attr" style="margin-top: 12px">
        {{ t("user.email") }}
      </div>
      <a-input v-model:value="data.email" />
      <div class="modal-attr">{{ t("user.name") }}</div>
      <a-input v-model:value="data.username" />
      <div class="modal-attr">{{ t("user.full_name") }}</div>
      <a-input v-model:value="data.full_name" />
      <div class="modal-attr">{{ t("user.password") }}</div>
      <a-input-password v-model:value="data.password" />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { registerUser } from "@/api";
import { validateEmail } from "@/views/Flows/until/util";
import { message } from "ant-design-vue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelShow"]);

const { t } = useI18n();

const data = ref({
  email: "",
  username: "",
  full_name: "",
  password: "",
});

const handleOk = async () => {
  if (
    !data.value.email ||
    !data.value.username ||
    !data.value.full_name ||
    !data.value.password
  ) {
    message.warning(t("user.please_fill_all_required"));
    return;
  }

  if (!validateEmail(data.value.email)) {
    message.warning(t("user.email_format_error"));
    return;
  }

  if (data.value.username.length < 3) {
    message.warning(t("user.username_length_error"));
    return;
  }

  // 3. 姓名长度校验（至少6位）
  if (data.value.full_name.length < 6) {
    message.warning(t("user.full_name_length_error"));
    return;
  }

  if (data.value.password.length < 6) {
    message.warning(t("user.password_length_error"));
    return;
  }

  try {
    const result = await registerUser(data.value);

    //console.log("用户注册成功，数据：", data.value);

    message.success(t("user.register_success"));
    emit("update:modelShow", false);
  } catch (error) {
    console.error("注册失败：", error);
    message.error(t("user.register_failed"));
  }
};

const handleModalOpenChange = (newOpenState: boolean) => {
  if (!newOpenState) {
  }

  emit("update:modelShow", newOpenState);
};
</script>

<style lang="less" scoped>
.modal {
  padding: 0 12px;

  &-attr {
    margin-top: 12px;
    margin-bottom: 6px;
  }
}
</style>
