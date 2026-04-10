<template>
  <div class="card" ref="pointRef">
    <div class="card-top">
      <Icons
        name="arrowLeft"
        type="mono-line"
        :size="28"
        :color="{ normal: '#222222FF' }"
        @click="onBack"
      />
      <span class="card-top-title">
        {{ t("device_manage.p_title") }}
      </span>
    </div>
    <div class="card-actions">
      <div class="card-actions-btns">
        <span>
          {{ t("device_manage.record_count", { count: data.length }) }}
        </span>
        <a-button type="primary" class="btn-add" @click="onClearAll">
          {{ t("connectivity_check.clear") }}
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
          <template v-if="column.dataIndex === 'actions'">
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
        </template>
      </a-table>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-finish-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
    <BACnetPointModal
      v-if="isBacnet"
      v-model:modelShow="isBacnet"
      :pointList="data"
      @onSaveSuccess="initData"
    />
    <ModbusPointModal
      v-if="isModbus"
      v-model:modelShow="isModbus"
      :isEdit="isEdit"
      :editData="displayData"
      @onSaveSuccess="initData"
    />
    <KNXPointModal
      v-if="isKNX"
      v-model:modelShow="isKNX"
      :isEdit="isEdit"
      :editData="displayData"
      @onSaveSuccess="initData"
    />
    <BACnetDisplayModal
      v-if="isBacnetEdit"
      v-model:modelShow="isBacnetEdit"
      :editData="displayData"
      @onSaveSuccess="initData"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { handleEditCompleteJump } from "../until/util";
import Icons from "@/icons/index.vue";
import { ref, computed, nextTick, onMounted, onUnmounted, provide } from "vue";
import { useRoute } from "vue-router";
import { DeviceTypeEnum } from "../DeviceManage/utils/options";
import { message } from "ant-design-vue";
import ModbusPointModal from "./ModbusPointModal/index.vue";
import BACnetPointModal from "./BACnetPointModal/index.vue";
import KNXPointModal from "./KNXPointModal/index.vue";
import BACnetDisplayModal from "./BACnetDisplayModal/index.vue";
import PropertyDisplayModal from "../DeviceManage/Modal/PropertyDisplayModal/index.vue";
import { useControllerStore } from "@/pinia/modules/controller";
import { useStepStore } from "@/pinia/modules/step";

const controllerStore = useControllerStore();
const stepStore = useStepStore();

const currentIP = stepStore.getCurrentIP();

const route = useRoute();
const { t } = useI18n();

const pointRef = ref<HTMLDivElement | null>(null);
const tableScrollHeight = ref<string | number>("auto");

const columns = computed(() => [
  {
    title: () => t("device_manage.point_name"),
    dataIndex: "point_name",
  },
  {
    title: () => t("device_manage.device_name"),
    dataIndex: "device_name",
  },
  {
    title: () => t("device_manage.point_m"),
    dataIndex: "point_m",
  },
  {
    title: () => t("device_manage.desc"),
    dataIndex: "description",
  },
  {
    title: () => t("device_manage.writable"),
    dataIndex: "writable",
    customRender: ({ text }: any) => {
      return (text ?? "").toString();
    },
  },
  {
    title: "",
    dataIndex: "actions",
    width: 120,
  },
]);

const calculateTableHeight = () => {
  if (!pointRef.value) {
    tableScrollHeight.value = 800;
    return;
  }

  nextTick(() => {
    if (!pointRef.value) return;

    // 获取card容器的总高度
    const cardHeight = pointRef.value.clientHeight;
    const topBar = pointRef.value.querySelector(".card-top");
    const topBarHeight = topBar ? topBar.clientHeight : 52;

    const actionsBar = pointRef.value.querySelector(".card-actions");
    const actionsBarHeight = actionsBar ? actionsBar.clientHeight : 52;

    const bottomReservedHeight = 80;
    const tableHeaderPadding = 40;

    const availableHeight =
      cardHeight -
      topBarHeight -
      bottomReservedHeight -
      tableHeaderPadding -
      actionsBarHeight;

    tableScrollHeight.value = Math.max(availableHeight, 200);
  });
};

const deviceInfo = ref({
  id: "",
  type: "",
  name: "",
});

const loading = ref(false);
const data = ref<any[]>([]);

let interval: number | null = null;

const isBacnet = ref(false);
const isModbus = ref(false);
const isKNX = ref(false);
const isBacnetEdit = ref(false);

const isEdit = ref(false);
const displayData = ref({});

onMounted(() => {
  calculateTableHeight();

  window.addEventListener("resize", calculateTableHeight);

  getDeviceInfo();
  initData();
});

onUnmounted(() => {
  window.removeEventListener("resize", calculateTableHeight);

  if (interval) {
    clearInterval(interval);
    interval = null;
  }
});

const getDeviceInfo = () => {
  const { id, type, name } = route.params;

  deviceInfo.value = {
    id: String(id || ""),
    type: String(type || ""),
    name: String(name || ""),
  };
};

const initData = async () => {
  loading.value = true;

  // console.log("Transformed data:", data.value);
  let pointList = controllerStore.getControllerPointsByDeviceId(
    currentIP,
    deviceInfo.value.id,
  );

  data.value = pointList.map((item: any) => {
    return {
      ...item, // 保留原有所有字段
      device_name: deviceInfo.value.name || "", // 追加设备名称
    };
  });

  loading.value = false;
};

const onClearAll = async () => {
  loading.value = true;

  controllerStore.clearAllPointsByDeviceID(currentIP, deviceInfo.value.id);

  data.value = [];
  message.success(t("msg.clear_all_success"));

  loading.value = false;
};

const onAdd = () => {
  if (deviceInfo.value.type === DeviceTypeEnum.BACnet) {
    isBacnet.value = true;
    isEdit.value = false;
  } else if (deviceInfo.value.type === DeviceTypeEnum.ModbusTCP) {
    isModbus.value = true;
    isEdit.value = false;
  } else if (deviceInfo.value.type === DeviceTypeEnum.KNX) {
    isKNX.value = true;
    isEdit.value = false;
  }
};

const onEdit = (record: any) => {
  displayData.value = record;

  if (deviceInfo.value.type === DeviceTypeEnum.BACnet) {
    isBacnetEdit.value = true;
  } else if (deviceInfo.value.type === DeviceTypeEnum.ModbusTCP) {
    isModbus.value = true;
    isEdit.value = true;
  } else if (deviceInfo.value.type === DeviceTypeEnum.KNX) {
    isKNX.value = true;
    isEdit.value = true;
  }
};

const onDelete = async (record: any) => {
  loading.value = true;

  controllerStore.deletePointFromControllerDevice(
    currentIP,
    deviceInfo.value.id,
    record.uid,
  );

  message.success(t("msg.delete_success"));

  data.value = data.value.filter((item) => item.uid !== record.uid);

  loading.value = false;
};

const onClick = () => {
  handleEditCompleteJump();
};

const onBack = () => {
  window.history.back();
};

provide("deviceInfo", deviceInfo);
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
