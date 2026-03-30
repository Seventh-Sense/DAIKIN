<template>
  <div>
    <a-table :columns="columns" :data-source="data">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <div class="table-actions">
            <Icons
              name="informationCircle"
              type="mono-line"
              :size="24"
              :color="{ normal: '#222222FF' }"
              @click="onEdit(record)"
            />
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
  </div>
</template>

<script setup lang="ts">
import { getUserList } from "@/api";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";

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

const onEdit = (record: any) => {

}

const onDelete = (record: any) => {
    
}
</script>

<style lang="less" scoped></style>
