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
    :confirmLoading="savingLoading"
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
          <span>{{ t("msg.total_points", { count: rawData.length }) }}</span>
          <a-button @click="handleSelectAll" :disabled="loading">
            {{
              isAllSelected ? t("common.unselect_all") : t("common.select_all")
            }}
          </a-button>
          <a-button
            type="primary"
            class="btn-add"
            @click="onSearch"
            :disabled="loading"
          >
            {{ t("device_manage.search") }}
          </a-button>
        </div>
      </div>

      <a-table
        size="middle"
        :loading="loading"
        :columns="columns"
        :data-source="displayData"
        :scroll="{ y: 400, x: 'max-content' }"
        :row-selection="rowSelection"
        :pagination="pagination"
        @change="handleTableChange"
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

const savingLoading = ref(false);

// 所有原始数据
const rawData = ref<any[]>([]);
// 当前页数据
const displayData = ref<any[]>([]);

// 全局选中集合（跨分页）
const checkedKeys = ref<Set<Key>>(new Set());
// 已存在点位（禁用）
const existedInstanceSet = ref<Set<number>>(new Set());

// 全选状态
const isAllSelected = ref(false);

const columns = [
  { title: () => t("device_manage.name"), dataIndex: "object_name" },
  { title: () => t("device_manage.type"), dataIndex: "object_type" },
  { title: () => t("device_manage.id"), dataIndex: "object_instance" },
];

// ======================
// 分页配置
// ======================
const pagination = ref({
  current: 1,
  pageSize: 50,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  pageSizeOptions: ["20", "50", "100", "200"],
  showQuickJumper: true,
});

// ======================
// 跨分页选择配置
// ======================
const rowSelection = computed(() => ({
  selectedRowKeys: Array.from(checkedKeys.value),
  onChange: (keys: Key[]) => {
    const currentPageKeys = new Set(displayData.value.map((item) => item.key));
    const oldChecked = Array.from(checkedKeys.value).filter((k) =>
      currentPageKeys.has(k),
    );
    oldChecked.forEach((k) => checkedKeys.value.delete(k));
    keys.forEach((k) => checkedKeys.value.add(k));
    isAllSelected.value = false;
  },
  getCheckboxProps: (record: any) => ({
    disabled: existedInstanceSet.value.has(record.object_instance),
  }),
}));

// ======================
// 【核心】全选功能：选中所有分页可选项
// ======================
const handleSelectAll = () => {
  if (isAllSelected.value) {
    checkedKeys.value.clear();
    isAllSelected.value = false;
  } else {
    const allAvailableKeys = rawData.value
      .filter((item) => !existedInstanceSet.value.has(item.object_instance))
      .map((item) => item.key);

    checkedKeys.value = new Set(allAvailableKeys);
    isAllSelected.value = true;
  }
};

// 切换分页
const handleTableChange = (page: any) => {
  pagination.value.current = page.current;
  pagination.value.pageSize = page.pageSize;
  refreshPageData();
};

// 刷新当前页数据
const refreshPageData = () => {
  const { current, pageSize } = pagination.value;
  const start = (current - 1) * pageSize;
  const end = current * pageSize;
  displayData.value = rawData.value.slice(start, end);
};

// ======================
// 初始化
// ======================
onMounted(() => {
  fetchNetworkInterfaces();
});

const fetchNetworkInterfaces = async () => {
  try {
    const result = await getNetWorkInterfaces();
    if (!result?.success) {
      message.error(t("device_search.network_interface_fetch_failed"));
      return;
    }
    const list = result.interfaces || [];
    if (!list.length) {
      message.warning(t("device_search.no_network_interfaces"));
      return;
    }
    networkOptions.value = list.map((item: any) => ({
      label: item.ip_address,
      value: item.ip_address,
    }));
    selectInterface.value = networkOptions.value[0]?.value;
  } catch (e) {
    message.error(t("device_search.network_request_error"));
  }
};

const onSearch = () => {
  initData();
};

// 加载点位
const initData = async () => {
  loading.value = true;
  clearAll();
  try {
    const device = stepStore.getCurrentDeviceInfo();
    if (!device || !selectInterface.value) {
      message.error(t("msg.content_missing"));
      return;
    }
    const { address } = device;
    const deviceId = device.property?.device_instance;
    if (!address || deviceId == null) {
      message.error(t("msg.device_info_invalid"));
      return;
    }

    const res = await discoveryBacnetPoints({
      network_interface: selectInterface.value,
      device_address: address,
      device_id: deviceId,
      timeout: 30,
    });

    const points = res?.points || [];
    rawData.value = formatPoints(points);
    pagination.value.total = rawData.value.length;
    refreshPageData();
  } catch (e) {
    console.error(e);
    message.error(t("msg.read_points_error"));
  } finally {
    loading.value = false;
  }
};

// 格式化数据
const formatPoints = (list: any[]) => {
  const existed = new Set(
    props.pointList
      .map((i: any) => i.property?.object_instance)
      .filter(Number.isFinite),
  );
  existedInstanceSet.value = existed;

  return list
    .filter((i) => i.object_type)
    .map((i) => {
      const ins = Number(i.object_instance);
      return {
        ...i,
        key: ins,
        disabled: existed.has(ins),
      };
    });
};

// ======================
// 提交：所有分页选中全部添加
// ======================
const handleOk = async () => {
  const selectedList = Array.from(checkedKeys.value);
  if (selectedList.length === 0) {
    message.warning(t("msg.please_select_points"));
    return;
  }

  // 1. 先开启 loading
  savingLoading.value = true;

  // 2. 强制等待浏览器一帧，让 loading 渲染出来（关键！）
  await new Promise((resolve) => setTimeout(resolve, 16));

  try {
    // 3. 再执行大数据量逻辑
    const addList = rawData.value.filter(
      (item) =>
        selectedList.includes(item.key) &&
        !existedInstanceSet.value.has(item.object_instance),
    );

    if (!addList.length) {
      message.success(t("msg.operation_success"));
      return;
    }

    const newPoints = addList.map((item) => ({
      uid: generateTimeUniqueId(),
      point_name: item.object_name,
      m: "",
      dev: "",
      description: "",
      writable: true,
      property: {
        object_type: item.object_type,
        object_instance: item.object_instance,
        min: undefined,
        max: undefined,
      },
    }));

    // 分批执行，避免彻底卡死 UI
    await new Promise((resolve) => {
      let i = 0;
      const batch = 500;
      function run() {
        const end = Math.min(i + batch, newPoints.length);
        for (; i < end; i++) {
          controllerStore.addPointToControllerDevice(
            currentIP,
            deviceInfo.value.id,
            newPoints[i],
          );
        }
        if (i >= newPoints.length) {
          resolve(null);
        } else {
          requestIdleCallback(run);
        }
      }
      run();
    });

    message.success(t("msg.add_points_success"));
    emit("onSaveSuccess");
  } catch (e) {
    console.error(e);
    message.error(t("msg.add_points_error"));
  } finally {
    savingLoading.value = false;
    emit("update:modelShow", false);
    clearAll();
  }
};

const handleModalOpenChange = (val: boolean) => {
  emit("update:modelShow", val);
  if (!val) clearAll();
};

const clearAll = () => {
  checkedKeys.value.clear();
  isAllSelected.value = false;
  rawData.value = [];
  displayData.value = [];
  pagination.value.current = 1;
  pagination.value.total = 0;
};
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 100%;
  padding: 10px 6px 0 6px;

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
