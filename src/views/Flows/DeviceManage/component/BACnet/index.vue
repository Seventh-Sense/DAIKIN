<template>
  <div class="content">
    <div class="content-top">
      <span> {{ t("device_manage.d_title") }} </span>

      <div class="content-top-right">
        <a-select
          v-model:value="selectInterface"
          :options="networkOptions"
          :placeholder="t('device_search.please_select_network_interface')"
          style="width: 200px"
        />
        <a-button type="primary" class="btn-add" @click="onSearch">
          {{ t("device_manage.search") }}
        </a-button>
      </div>
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
import { ref, inject, onUnmounted, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Icons from "@/icons/index.vue";
import { message } from "ant-design-vue";
import { DeviceTypeEnum } from "../../utils/options";
import {
  discoveryBacnetDevices,
  getNetWorkInterfaces,
} from "@/api/modules/page";
import { generateTimeUniqueId } from "@/utils/function";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";

const controllerStore = useControllerStore();
const stepStore = useStepStore();

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

const networkOptions = ref<any[]>([]);
const selectInterface = ref<string | undefined>(undefined);

const columns = [
  { title: () => t("device_manage.name"), dataIndex: "device_name" },
  { title: () => t("device_manage.slave_id"), dataIndex: "device_id" },
  { title: () => t("device_manage.address"), dataIndex: "address" },
  { title: () => t("device_manage.vendor"), dataIndex: "vendor_name" },
  { title: "", dataIndex: "actions", width: 80, align: "center" },
];

onMounted(() => {
  fetchNetworkInterfaces();
});

onUnmounted(() => {
  // 清理数据，避免组件卸载后数据残留
  data.value = [];
});

const fetchNetworkInterfaces = async () => {
  try {
    const result = await getNetWorkInterfaces();

    if (!result || !result.success) {
      message.error(t("device_search.network_interface_fetch_failed"));
      return;
    }

    const ifaceList = result.interfaces || [];
    if (ifaceList.length === 0) {
      message.warning(t("device_search.no_network_interfaces"));
      networkOptions.value = [];
      selectInterface.value = undefined;
      return;
    }

    networkOptions.value = ifaceList.map((item: any) => ({
      label: item.ip_address,
      value: item.ip_address,
    }));

    selectInterface.value = networkOptions.value[0]?.value;

    //console.log("获取网络接口结果:", result);
  } catch (error) {
    console.error("获取网络接口失败:", error);
    message.error(t("device_search.network_request_error"));
  }
};

const onSearch = async () => {
  if (!selectInterface.value) {
    message.warn("");
    return;
  }

  loading.value = true;
  //console.log("Search clicked with data:", props.data);

  try {
    const result = await discoveryBacnetDevices(selectInterface.value);

    if (!result || !result.success) {
      message.error(t(""));
      return;
    }

    const selectList = result.devices || [];
    if (selectList.length === 0) {
      message.warning(t(""));
      return;
    }

    console.log(deviceList.value);

    data.value = markExistingIds(selectList, deviceList.value);

    message.success(t("msg.search_success", { count: selectList.length }));
  } catch (error) {
    console.error("Error during search:", error);
    const errorMsg = (error as Error).message || t("msg.unknown_error");
    message.error(t("msg.search_failed_exception", { reason: errorMsg }));
  } finally {
    loading.value = false;
  }
};

const markExistingIds = (searchList: any[], existingDeviceList: any[]) => {
  // 提前判空，避免arrayB为undefined/null时报错
  if (!Array.isArray(existingDeviceList))
    return searchList.map((item) => ({ ...item, disabled: false }));

  const bacnetExistingList = existingDeviceList.filter(
    (item) => item?.device_type === DeviceTypeEnum.BACnet,
  );

  const existKeys = new Set(
    bacnetExistingList.map((item) => {
      const addr = item.address || "";
      const devId = item.property?.device_id ?? "";
      return `${addr}_${devId}`; // 组合唯一键
    }),
  );

  return searchList.map((item) => {
    const currentKey = `${item.address}_${item.device_id}`;
    return {
      ...item,
      disabled: existKeys.has(currentKey), // 已存在 = 禁用
    };
  });
};

const onDownload = async (record: any) => {
  //console.log("Edit clicked for record:", record);
  let load = {
    uid: generateTimeUniqueId(),
    device_name: record.device_name,
    device_type: DeviceTypeEnum.BACnet,
    device_sn: "",
    device_dev: "",
    polling: props.data.polling,
    address: record.address,
    description: "",
    enabled: true,
    property: {
      device_id: record.device_id,
      vendor_name: record.vendor_name,
      vendor_id: record.vendor_id,
      model_name: record.model_name,
      max_apdu_length: record.max_apdu_length,
      segmentation_supported: record.segmentation_supported,
    },
  };

  controllerStore.addDeviceToController(stepStore.getCurrentIP(), load);

  message.success(t("msg.download_success"));

  data.value.map((item) => {
    if (record.device_id === item.device_id) {
      item.disabled = true;
    }
  });
};
</script>

<style lang="less" scoped>
.content {
  &-top {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}
</style>
