<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('device_manage.add_point')"
    :width="800"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('mqtt.save')"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-top">
        <a-select
          v-model:value="selectInterface"
          :options="networkOptions"
          :placeholder="t('device_search.please_select_network_interface')"
          style="width: 200px"
        />
        <div class="modal-right">
          <span>{{ t('msg.total_points', { count: data.length }) }}</span>
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
        :row-selection="rowSelection"
      >
      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import {
  discoveryBacnetPoints,
  getNetWorkInterfaces,
} from "@/api/modules/page";
import { useStepStore } from "@/pinia/modules/step";
import { generateTimeUniqueId } from "@/utils/function";
import { useControllerStore } from "@/pinia/modules/controller";

const controllerStore = useControllerStore();
const stepStore = useStepStore();

type Key = string | number;

const emit = defineEmits(["update:modelShow", "onSaveSuccess"]);

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  pointList: {
    type: Array,
    required: true,
  },
});

const networkOptions = ref<any[]>([]);
const selectInterface = ref<string | undefined>(undefined);

const currentIP = stepStore.getCurrentIP();

const deviceInfo: any = inject("deviceInfo");

const { t } = useI18n();
const loading = ref(false);

const columns = [
  { title: () => t("device_manage.name"), dataIndex: "object_name" },
  { title: () => t("device_manage.type"), dataIndex: "object_type" },
  { title: () => t("device_manage.id"), dataIndex: "object_instance" },
];

const data = ref<any[]>([]);

const selectedRowKeys = ref<Key[]>([]);

//已经添加过的点位
const selectedObjKeys = ref<string[]>([]);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: any[], rows: any[]) => {
    selectedRowKeys.value = keys;
  },
  getCheckboxProps: (record: any) => ({
    disabled: record.disabled,
    value: record.key,
  }),
}));

onMounted(() => {
  fetchNetworkInterfaces();
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

const onSearch = () => {
  initData();
};

const initData = async () => {
  loading.value = true;

  try {
    const deviceInfo = stepStore.getCurrentDeviceInfo();

    if (!deviceInfo || !selectInterface.value) {
      message.error(t("msg.content_missing"));
      return;
    }

    const { address } = deviceInfo;
    const deviceId = deviceInfo.property?.device_id;

    if (!address || deviceId == null) {
      message.error(t("msg.device_info_invalid"));
      return;
    }

    const result = await discoveryBacnetPoints({
      network_interface: selectInterface.value,
      device_address: deviceInfo.address,
      device_id: deviceInfo.property.device_id,
      timeout: 30,
    });

    const rawPoints = result?.points || [];

    data.value = convertToDataTypes(props.pointList, rawPoints);
  } catch (error) {
    console.error("Error initializing data:", error);
    message.error(t("msg.read_points_error"));
  } finally {
    loading.value = false;
  }
};

const convertToDataTypes = (selectedData: any[], resData: any[]): any[] => {
  selectedObjKeys.value = selectedData.map(
    (item) => item.property?.object_instance,
  );

  const mergedKeysSet = new Set(selectedObjKeys.value);
  //console.log("mergedKeysSet", selectedData, resData);

  const invalidTypeNames = [""];

  return resData
    .filter((item) => !invalidTypeNames.includes(item.object_type)) // 过滤无效类型
    .map((item) => {
      return {
        ...item,
        key: item.object_instance, // 唯一标识符
        disabled: mergedKeysSet.has(item.object_instance), // 设置禁用状态
      };
    });
};

const handleOk = async () => {
  //console.log("selectedRowKeys", selectedRowKeys.value);
  if (selectedRowKeys.value.length === 0) {
    return;
  }

  try {
    const newPoints = selectedRowKeys.value.reduce((list: any, key) => {
      // 跳过已存在的点位
      if (selectedObjKeys.value.includes(String(key))) return list;

      // 查找对应记录
      const record = data.value.find((item) => item.key === key);
      if (!record) return list;

      // 组装点位数据
      list.push({
        uid: generateTimeUniqueId(),
        point_name: record.object_name,
        point_m: "",
        description: "",
        writable: true,
        property: {
          object_type: record.object_type,
          object_instance: record.object_instance,
        },
      });

      return list;
    }, []);

    if (!newPoints.length) {
      clearAll();
      emit("update:modelShow", false);
      return;
    }

    newPoints.forEach((point: any) => {
      controllerStore.addPointToControllerDevice(
        currentIP,
        deviceInfo.value.id,
        point,
      );
    });

    console.log("Points to add:", newPoints);

    emit("onSaveSuccess");
  } catch (error) {
    console.error("Error handleOk data:", error);
    message.error(t("msg.add_points_error"));
  } finally {
    clearAll();
    emit("update:modelShow", false);
  }
};

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
    clearAll();
  }
};

const clearAll = () => {
  selectedRowKeys.value = [];
  selectedObjKeys.value = [];
  data.value = [];
};
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 100%;
  padding: 10px 6px 0 6px;

  &-porperty {
    margin-bottom: 4px;
  }

  &-top {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
