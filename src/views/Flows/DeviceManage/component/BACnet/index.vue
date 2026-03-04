<template>
  <div class="content">
    <div class="content-top">
      <span> 设备列表 </span>
      <a-button type="primary" class="btn-add" @click="onSearch">查询</a-button>
    </div>
    <a-table
      size="middle"
      :loading="loading"
      :columns="columns"
      :data-source="data"
      :scroll="{ y: 400 }"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <Icons
            name="download"
            type="mono-line"
            :size="24"
            :color="{ normal: '#222222FF' }"
            @click="onDownload(record)"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";
import { generateMockDeviceData, markExistingIds } from "../../utils/utils";

const { t } = useI18n();

const deviceList: any = inject("deviceList");

const props = defineProps({
  data: {
    type: Object as () => any,
    required: true,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const loading = ref(false);
const data = ref<any[]>([]);

const columns = [
  { title: () => t("device_manage.name"), dataIndex: "object_name" },
  { title: () => t("device_manage.slave_id"), dataIndex: "id" },
  { title: () => t("device_manage.address"), dataIndex: "address" },
  { title: () => t("device_manage.vendor"), dataIndex: "vendor_name" },
  { title: "", dataIndex: "actions", width: 80, align: "center" },
];

const onSearch = () => {
  loading.value = true;
  console.log("Search clicked with data:", props.data);

  try {
    const mockData = generateMockDeviceData(10);

    setTimeout(() => {
      data.value = markExistingIds(mockData, deviceList.value);
      loading.value = false;
    }, 500);
  } catch (error) {
    console.error("Error during search:", error);
    loading.value = false;
  }
};

const onDownload = (record: any) => {
  console.log("Edit clicked for record:", record);
  try {

  } catch (error) {
    console.error("Error during download:", error);
  }
};
</script>

<style lang="less" scoped>
.content {
  &-top {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
