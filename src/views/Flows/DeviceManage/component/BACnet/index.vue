<template>
  <div class="content">
    <div class="content-top">
      <span> {{ t("device_manage.d_title") }} </span>
      <a-button type="primary" class="btn-add" @click="onSearch">
        {{ t("device_manage.search") }}
      </a-button>
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
            v-if="!record.disabled"
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
import { ref, inject, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";
import { markExistingIds } from "../../utils/utils";
import { discoveryDevices, addDevice } from "@/api";
import { message } from "ant-design-vue";
import { DeviceTypeEnum } from "../../utils/options";

const { t } = useI18n();

interface DataType {
  key: number;
  object_name: string;
  model_name: string;
  vendor_name: string;
  address: string;
  id: string;
  type: string;
  disabled?: boolean;
}

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

onUnmounted(() => {
  // 清理数据，避免组件卸载后数据残留
  data.value = [];
});

const onSearch = async () => {
  loading.value = true;
  //console.log("Search clicked with data:", props.data);

  try {
    const res = await discoveryDevices();

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.status);
      message.error(t("msg.search_failed_status", { status: res.status }));
      return;
    }

    if (res.data.length === 0) {
      message.warning(t("msg.search_no_result"));
      return;
    }

    const transformedData = transformDeviceData(res.data);

    data.value = markExistingIds(transformedData, deviceList.value);

    message.success(t("msg.search_success", { count: res.data.length }));
  } catch (error) {
    console.error("Error during search:", error);
    const errorMsg = (error as Error).message || t("msg.unknown_error");
    message.error(t("msg.search_failed_exception", { reason: errorMsg }));
  } finally {
    loading.value = false;
  }
};

const transformDeviceData = (deviceList: any[], startIndex = 1): DataType[] => {
  return deviceList.map((item: any, index: number) => ({
    key: index + startIndex, // 支持自定义起始key，默认从1开始
    object_name: item["object-name"],
    model_name: item["model-name"],
    vendor_name: item["vendor-name"],
    address: item.addr,
    id: item.id,
    type: item.type,
  }));
};

const onDownload = async (record: any) => {
  //console.log("Edit clicked for record:", record);
  try {
    let load = {
      uid: record.id,
      name: record.object_name,
      address: record.address,
      protocol: DeviceTypeEnum.BACnet,
      enabled: true,
      status: "",
      description: "",
      property: {
        "model-name": record.model_name,
        "vendor-name": record.vendor_name,
      },
      tags: "",
    };
    
    const res = await addDevice(load);

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.status);
      message.error(t("msg.download_failed_status"));
      return;
    }
    message.success(t("msg.download_success"));

    data.value.map((item) => {
      if (record.id === item.id) {
        item.disabled = true;
      }
    });
  } catch (error) {
    console.error("Error during download:", error);
    message.error(t("msg.download_failed_exception"));
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
