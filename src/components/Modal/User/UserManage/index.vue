<template>
  <div class="user" style="position: relative; height: 100%">
    <div class="user-top">
      <a-button type="primary" class="modal-btn" @click="onAdd">
        {{ t("user.add") }}
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="data">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <div class="table-actions">
            <Icons
              name="delete"
              type="mono-line"
              :size="24"
              :color="{ normal: '#F76F83FF' }"
              @click="onDelete(record)"
            />
          </div>
        </template>
      </template>
    </a-table>
    <UserCreate v-model:modelShow="showModal" />
  </div>
</template>

<script setup lang="ts">
import { deleteUser, getUserList } from "@/api";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";
import { useUserStore } from "@/pinia/modules/user";
import UserCreate from "@/components/Modal/User/UserCreate/index.vue";
import { message } from "ant-design-vue";

const userStore = useUserStore();
const { t } = useI18n();

const columns = computed(() => [
  {
    title: t("user.name"),
    dataIndex: "username",
    key: "username",
  },
  {
    title: t("user.full_name"),
    dataIndex: "full_name",
    key: "full_name",
  },
  {
    title: t("user.email"),
    dataIndex: "email",
    key: "email",
  },
  {
    title: t("user.create_time"),
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: t("user.update_time"),
    dataIndex: "updated_at",
    key: "updated_at",
  },
  {
    title: "",
    dataIndex: "actions",
    key: "actions",
  },
]);

const showModal = ref(false);
const mode = ref(false);

const data = ref([]);

onMounted(() => {
  readUserList();
});

const readUserList = async () => {
  try {
    const result = await getUserList();

    if (result && result.length > 0) {
      data.value = result;
    }
    console.log(data.value);
  } catch (e) {
    console.log("readUserList", e);
  }
};

// 监听弹窗关闭，刷新表格
watch(showModal, (newVal) => {
  // 当弹窗从显示变为隐藏时刷新
  if (!newVal) {
    readUserList();
  }
});

const onAdd = () => {
  showModal.value = true;
};

const deleteLoading = ref(false);

const onDelete = async (record: any) => {
  if (deleteLoading.value) return;

  deleteLoading.value = true;

  try {
    await deleteUser(record.id);

    message.success(t("user.delete_success"));
  } catch (e) {
    console.log("onDelete", e);
    message.error(t("user.delete_failed"));
  } finally {
    // 重置加载状态
    deleteLoading.value = false;
  }
};
</script>

<style lang="less" scoped>
.user {
  &-top {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 48px;
  }
}

.table-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
</style>
