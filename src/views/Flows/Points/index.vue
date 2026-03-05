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
          <template v-else-if="column.dataIndex === 'metric_uid'">
            {{ getDeviceIDLabel(record) }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            {{
              record.status === 0
                ? t("device_manage.offline")
                : t("device_manage.online")
            }}
          </template>
        </template>
      </a-table>
    </div>
    <div class="card-finish">
      <a-button type="primary" class="card-finish-btn" @click="onClick">
        {{ t("common.edit_complete") }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { handleEditCompleteJump } from "../until/util";
import Icons from "@/icons/index.vue";
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { readPointValue, readSubscribePoints } from "@/api";
import {
  transformSubscribePointsData,
  formatTimestamp,
  getProcessedValue,
  mergeProperties,
} from "./tool";
import { DeviceTypeEnum } from "../DeviceManage/utils/options";

const route = useRoute();

const { t } = useI18n();

const pointRef = ref<HTMLDivElement | null>(null);
const tableScrollHeight = ref<string | number>("auto");

const columns = computed(() => [
  {
    title: () => t("device_manage.name"),
    dataIndex: "metric_name",
  },
  {
    title: () => t("device_manage.id"),
    dataIndex: "metric_uid",
  },
  { title: () => t("device_manage.status"), dataIndex: "status" },
  { title: () => t("device_manage.value"), dataIndex: "value" },
  { title: () => t("device_manage.tags"), dataIndex: "tags" },
  { title: () => t("device_manage.desc"), dataIndex: "description" },
  { title: () => t("device_manage.time"), dataIndex: "timestamp" },
  {
    title: "",
    dataIndex: "actions",
    width: 120,
  },
]);

const calculateTableHeight = () => {
  // 修复：增加空值判断，避免TypeScript报错
  if (!pointRef.value) {
    // 如果cardRef为空，设置默认高度
    tableScrollHeight.value = 800;
    return;
  }

  nextTick(() => {
    // 再次确认不为空（nextTick后可能的变化）
    if (!pointRef.value) return;

    // 获取card容器的总高度
    const cardHeight = pointRef.value.clientHeight;
    // 获取顶部栏高度（增加空值判断）
    const topBar = pointRef.value.querySelector(".card-top");
    const topBarHeight = topBar ? topBar.clientHeight : 52;
    // 获取按钮栏高度（增加空值判断）
    const actionsBar = pointRef.value.querySelector(".card-actions");
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

const deviceInfo = ref({
  id: "",
  type: "",
  key: "",
});
const loading = ref(false);
const data = ref<any[]>([]);

let interval: number | null = null;

onMounted(() => {
  calculateTableHeight();

  window.addEventListener("resize", calculateTableHeight);

  getDeviceInfo();
  initData();
});

onUnmounted(() => {
  window.removeEventListener("resize", calculateTableHeight);
});

const onBack = () => {
  window.history.back();
};

const getDeviceInfo = () => {
  const { id, type, key } = route.params;

  deviceInfo.value = {
    id: String(id || ""),
    type: String(type || ""),
    key: String(key || ""),
  };
};

const getDeviceIDLabel = (record: any) => {
  if (deviceInfo.value.type === DeviceTypeEnum.BACnet) {
    return record.metric_type + "," + record.metric_id;
  } else {
    return record.metric_uid;
  }
};

const initData = async () => {
  loading.value = true;

  try {
    const res = await readSubscribePoints(deviceInfo.value.key);

    if (res.status !== "OK" || res.data === null) {
      console.warn("Non-OK response status:", res.status);
      return;
    }

    const transformedData = transformSubscribePointsData(
      res.data,
      deviceInfo.value.id,
    );

    data.value = [...transformedData];

    // console.log("Transformed data:", data.value);
    periodicReading();
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
};

const periodicReading = () => {
  if (interval !== null) {
    clearInterval(interval);
  }

  if (data.value.length === 0) return;

  periodicFunc();
};

const periodicFunc = async () => {
  try {
    const res = await readPointValue(deviceInfo.value.key);

    if (res.status !== "OK" || res.data === null) {
      console.warn("Non-OK response status:", res.status);
      return;
    }

    // 创建快速查询映射
    const metricPoints = new Map(
      res.data.map((point: any) => [point.metric_id, point]),
    );
    // 生成新的数据源（不可变更新）
    const updatedData = data.value.map((originalItem) => {
      const point: any = metricPoints.get(originalItem.key);
      if (!point) return originalItem;

      //console.log('point', point, originalItem)
      return {
        ...originalItem,
        value: getProcessedValue(
          point,
          originalItem.metric_type,
          deviceInfo.value.type,
        ),
        properties: mergeProperties(point.property, originalItem.properties),
        //description: getDescription(point, originalItem),
        status: point.status,
        timestamp: formatTimestamp(point.timestamp),
      };
    });

    // 更新状态
    data.value = updatedData;
  } catch (error) {
    console.error("Error in periodic reading:", error);
  }
};

const onClearAll = () => {};

const onAdd = () => {};

const onEdit = (record: any) => {};

const onDelete = (record: any) => {};

const onClick = () => {
  handleEditCompleteJump();
};
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
