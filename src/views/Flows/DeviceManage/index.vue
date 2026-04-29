<template>
  <div class="card" ref="cardRef">
    <div class="card-top">
      <span class="card-top-title">
        {{ t("device_manage.d_title") }}
      </span>
    </div>
    <div class="card-actions">
      <div class="card-actions-btns">
        <span>
          {{ t("device_manage.record_count", { count: data.length }) }}
        </span>
        <a-button type="primary" class="btn-add" @click="onImport">
          {{ t("ui.import") }}
        </a-button>
        <a-button type="primary" class="btn-add" @click="onExport">
          {{ t("ui.export") }}
        </a-button>
        <a-button type="primary" class="btn-add" @click="onAdd">
          {{ t("ui.add") }}
        </a-button>
      </div>
    </div>
    <div class="card-content">
      <a-table
        size="middle"
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :pagination="false"
        :scroll="{ y: tableScrollHeight }"
        :row-class-name="
          (_record: any, index: any) =>
            index % 2 === 1 ? 'table-striped1' : 'table-striped2'
        "
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'link'">
            <Icons
              name="file"
              type="mono-line"
              :size="24"
              :color="{ normal: '#222222FF' }"
              @click="onEnter(record)"
            />
          </template>
          <template v-else-if="column.dataIndex === 'actions'">
            <div class="table-actions">
              <Icons
                name="edit"
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
          <!-- <template v-else-if="column.dataIndex === 'device_type'">
            {{ getDeviceTypeLabel(record.device_type) }}
          </template> -->
        </template>
      </a-table>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-finish-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>

    <DeviceSetModal
      v-if="showModal"
      v-model:modelShow="showModal"
      :isEdit="isEdit"
      :initData="deviceData"
      @onSaveSuccess="initData"
    />
    <BACnetModal
      v-if="showBacnet"
      v-model:modelShow="showBacnet"
      :initData="deviceData"
      @onSaveSuccess="initData"
    />
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx, .xls"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { handleEditCompleteJump } from "../until/util";
import { useI18n } from "vue-i18n";
import {
  onMounted,
  ref,
  computed,
  nextTick,
  onUnmounted,
  provide,
  watch,
} from "vue";
import Icons from "@/icons/index.vue";
import {
  getDeviceTypeLabel,
  exportDataTrans,
  importFileTrans,
} from "./utils/utils";
import { routerTurnByNameWithParams } from "../../../router/util";
import { processExcel } from "./utils/xlsx";
import { message } from "ant-design-vue";
import DeviceSetModal from "./Modal/DeviceSetModal/index.vue";
import BACnetModal from "./Modal/BACnetModal/index.vue";
import { DeviceTypeEnum } from "./utils/options";
import { useStepStore } from "@/pinia/modules/step";
import { useControllerStore } from "@/pinia/modules/controller";

const stepStore = useStepStore();
const controllerStore = useControllerStore();

const { t } = useI18n();

const columns = computed(() => [
  { title: "", dataIndex: "link", width: 50 },
  {
    title: t("device_manage.device_name"),
    dataIndex: "device_name",
  },
  {
    title: t("device_manage.device_type"),
    dataIndex: "protocol",
  },
  {
    title: t("device_manage.device_sn"),
    dataIndex: "sn",
  },
  {
    title: t("mqtt.pkey"),
    dataIndex: "pkey",
  },
  { title: t("device_manage.polling"), dataIndex: "polling" },
  {
    title: t("device_manage.address"),
    dataIndex: "address",
  },
  { title: t("device_manage.desc"), dataIndex: "description" },
  {
    title: t("device_manage.group"),
    dataIndex: "group",
    customRender: ({ text }: any) => {
      return (text ?? "").toString();
    },
  },
  {
    title: "",
    dataIndex: "actions",
    width: 120,
    customClassName: "actions-column-cell",
  },
]);

// 定义card容器的引用
const cardRef = ref<HTMLDivElement | null>(null);
// 表格滚动高度
const tableScrollHeight = ref<string | number>("auto");

const calculateTableHeight = () => {
  // 修复：增加空值判断，避免TypeScript报错
  if (!cardRef.value) {
    // 如果cardRef为空，设置默认高度
    tableScrollHeight.value = 800;
    return;
  }

  nextTick(() => {
    // 再次确认不为空（nextTick后可能的变化）
    if (!cardRef.value) return;

    // 获取card容器的总高度
    const cardHeight = cardRef.value.clientHeight;
    // 获取顶部栏高度（增加空值判断）
    const topBar = cardRef.value.querySelector(".card-top");
    const topBarHeight = topBar ? topBar.clientHeight : 52;
    // 获取按钮栏高度（增加空值判断）
    const actionsBar = cardRef.value.querySelector(".card-actions");
    const actionsBarHeight = actionsBar ? actionsBar.clientHeight : 52;
    // 底部按钮区域的预留高度（包含margin）
    const bottomReservedHeight = 80;
    // 表格头部和内边距的预留高度
    const tableHeaderPadding = 40;

    // 计算表格可滚动区域的高度
    const availableHeight =
      cardHeight -
      topBarHeight -
      bottomReservedHeight -
      tableHeaderPadding -
      actionsBarHeight;

    // 确保高度不会太小
    tableScrollHeight.value = Math.max(availableHeight, 200);
  });
};

const data = ref<any[]>([]);

const loading = ref(false);

const showModal = ref(false);
const showBacnet = ref(false);

const isEdit = ref(false);
const deviceData = ref({});

const currentIP = stepStore.getCurrentIP();

//文件导入
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  calculateTableHeight();
  // 监听窗口大小变化，重新计算高度
  window.addEventListener("resize", calculateTableHeight);

  initData();
});

onUnmounted(() => {
  window.removeEventListener("resize", calculateTableHeight);
});

const initData = async () => {
  loading.value = true;

  data.value = controllerStore.getControllerDevices(currentIP);

  loading.value = false;
};

const onAdd = () => {
  deviceData.value = {};
  showModal.value = true;
  isEdit.value = false;
};

//导入
const onImport = () => {
  fileInput.value?.click();
};

// 处理文件上传
const handleFileUpload = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    console.warn("未选择任何文件");
    return;
  }

  const file = input.files[0];
  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    message.warn(t("device_manage.excelSelectTip"));
    input.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const data = e.target?.result as ArrayBuffer;
      const sheetsData = processExcel(data, {
        minSheetCount: 2, // 要求至少2个工作表
        jsonFields: ["property"], // 需要解析JSON的字段
        t,
      });

      let result = importFileTrans(sheetsData.sheets);

      controllerStore.setControllerDevices(currentIP, result);

      initData();
    } catch (error) {
      console.error("文件处理失败:", error);
      message.warn(t("device_manage.fileProcessError"));
    } finally {
      // 重置输入以允许重复选择相同文件
      input.value = "";
    }
  };

  // 处理文件读取错误
  reader.onerror = (error) => {
    console.error("文件读取失败:", error);
    message.warn(t("device_manage.fileReadError"));
    input.value = "";
  };

  reader.readAsArrayBuffer(file);
};

//导出
const onExport = async () => {
  try {
    const deviceList = controllerStore.getControllerDevices(currentIP);

    if (!deviceList || deviceList.length === 0) {
      //message.warning(t("device_manage.export_empty_tip"));
      return;
    }

    exportDataTrans(deviceList);
  } catch (error) {
    console.error(`导出失败：`, error);

    const errorMsg = (error as Error).message;
    message.error(
      t("msg.export_failed", { reason: errorMsg || t("msg.unknownError") }),
    );
  }
};

//table操作
const onEdit = async (record: any) => {
  deviceData.value = { ...record };

  if (record.protocol === DeviceTypeEnum.BACnet) {
    showBacnet.value = true;
  } else {
    showModal.value = true;
    isEdit.value = true;
  }
};

const onDelete = async (record: any) => {
  //console.log("删除", record);
  controllerStore.deleteDeviceFromController(currentIP, record.uid);

  data.value = data.value.filter((item: any) => item.uid !== record.uid);

  message.success(t("msg.deleteSuccess"));
};

const onEnter = (record: any) => {
  //console.log("进入点位:", record);
  routerTurnByNameWithParams("Points", {
    id: record.uid,
    type: record.protocol,
    name: record.device_name,
  });

  //存储当前设备信息，供点位页面使用
  const { points, ...currentDeviceInfo } = record;
  stepStore.setCurrentDeviceInfo(currentDeviceInfo);
};

const onClick = () => {
  handleEditCompleteJump();
};

provide("deviceList", data);
</script>

<style lang="less" scoped>
.card {
  background-color: var(--sidebar-bg);
  height: calc(100vh - 80px);
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  &-top {
    height: 52px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    &-title {
      font-weight: bold;
      font-size: 14px;
      color: var(--header-text-color);
      line-height: 20px;
      text-align: left;
      font-style: normal;
    }
  }

  &-actions {
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &-btns {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  &-content {
    overflow: hidden;
    margin-bottom: 60px;
    flex: 1;
    max-height: calc(100% - 60px);
  }

  &-finish {
    position: fixed;
    right: 24px;
    bottom: 20px;

    &-btn {
      width: 74px;
      height: 32px;
      padding: 0;
      border-radius: 0;
    }
  }
}

.btn-add {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 0;
}

.table-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

:deep(.ant-table) {
  background: transparent !important;
}

:deep(.ant-table-cell) {
  height: 44px !important;
  padding: 0 8px !important;
}

:deep(.ant-table-thead) {
  tr th {
    background: var(--topic-card-bg-color) !important;
    border: 0 !important;
  }

  // 表头第一个单元格左上+左下圆角
  tr th:first-child {
    border-top-left-radius: 8px !important;
    border-bottom-left-radius: 8px !important;
  }

  // 表头最后一个单元格右上+右下圆角
  tr th:last-child {
    border-top-right-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
  }
}

:deep(.table-striped1) td {
  background: var(--topic-card-bg-color) !important;
  color: var(--sider-menu-select-font-color);
  font-weight: 400;
}

:deep(.table-striped1) td:first-child {
  border-radius: 8px 0 0 8px !important;
}

:deep(.table-striped1) td:last-child {
  border-radius: 0 8px 8px 0 !important;
}

:deep(.ant-table-tbody) tr td {
  border: 0 !important;
}
</style>
