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
      <a-row :gutter="32">
        <a-col :span="12">
          <div>
            <div class="modal-porperty">{{ $t("device_manage.id") }}</div>
            <a-input
              v-model:value="deviceInfo.id"
              style="margin-bottom: 12px"
              disabled
            />
          </div>
        </a-col>
        <a-col :span="12">
          <div class="modal-porperty">{{ $t("device_manage.type") }}</div>
          <a-input
            v-model:value="deviceInfo.type"
            style="margin-bottom: 12px"
            disabled
          />
        </a-col>
      </a-row>
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
import { addSubscribePoint, readIotPoints } from "@/api";
import { cloneDeep } from "lodash";
import { computed, inject, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  getDeviceTypeId,
  getDeviceTypeName,
} from "../../DeviceManage/utils/utils";
import { type TableProps, type TableColumnType, message } from "ant-design-vue";
import jsonList from "../../DeviceManage/utils/Property.json";

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

const deviceInfo: any = inject("deviceInfo");

const { t } = useI18n();
const loading = ref(false);

const columns = [
  { title: () => t("device_manage.name"), dataIndex: "name" },
  { title: () => t("device_manage.type"), dataIndex: "type" },
  { title: () => t("device_manage.id"), dataIndex: "id" },
];

const data = ref<any[]>([]);

const selectedRowKeys = ref<Key[]>([]);
const selectedRows = ref<any[]>([]);

//已经添加过的点位
const selectedObjKeys = ref<string[]>([]);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: any[], rows: any[]) => {
    selectedRowKeys.value = keys;
    selectedRows.value = rows;
  },
  getCheckboxProps: (record: any) => ({
    disabled: record.disabled,
    value: record.key,
  }),
}));

onMounted(() => {
  console.log("initData", deviceInfo.value);
  initData();
});

const initData = async () => {
  loading.value = true;

  try {
    const res = await readIotPoints(deviceInfo.value.key, {
      function: "read_object_list",
      parms: {
        address: deviceInfo.value.address,
        objid: deviceInfo.value.id,
      },
    });

    if (res.status !== "OK") {
      if (res.data.includes("not enabled")) {
        console.warn("Device is not enabled for point reading.");
        message.warning(t("msg.device_not_enabled"));
      } else {
        console.warn("Failed to read points: " + res.data);
        message.error(t("msg.read_points_error"));
      }

      loading.value = false;
      return;
    }

    if (res.data.length === 0) {
      console.info("No points found for the device.");
      message.info(t("msg.no_points_found"));
      loading.value = false;
      return;
    }

    //只返回对象名称
    fetchProperties(convertToDataTypes(props.pointList, res.data));
  } catch (error) {
    console.error("Error initializing data:", error);
    message.error(t("msg.read_points_error"));
    loading.value = false;
  }
};

const convertToDataTypes = (selectedData: any[], resData: any[]): any[] => {
  selectedObjKeys.value = selectedData.map(({ metric_uid }) => `${metric_uid}`);

  const mergedKeysSet = new Set([...selectedObjKeys.value]);
  //console.log('mergedKeysSet', mergedKeysSet)

  return resData
    .filter(([typeNum]) => ![8, 15, 17, 20, 56].includes(typeNum)) // 过滤无效类型
    .map(([typeNum, idNum]) => {
      const compositeKey = `${typeNum},${idNum}`; // 生成复合键

      return {
        key: compositeKey, // 唯一标识符
        name: "", // 保留字段（后续可能需要填充）
        type: getDeviceTypeName(parseInt(typeNum)), // 确保字符串类型
        id: idNum.toString(), // 确保字符串类型
        disabled: mergedKeysSet.has(compositeKey), // 设置禁用状态
      };
    });
};

const fetchProperties = async (initialDatas: any[]) => {
  try {
    // 创建数据副本以避免修改原始数据
    const dataCopy = initialDatas.map((item) => ({ ...item }));

    const dataMap = new Map<string, any>(
      dataCopy.map((item) => [item.key.toString(), item]),
    );

    // 分块处理
    const chunks = processDataChunks(initialDatas, 5);

    // 创建所有请求
    const requests = chunks.map((chunk) =>
      readIotPoints(deviceInfo.value.key, {
        function: "read_property_multiple",
        parms: {
          address: deviceInfo.value.address,
          read_list: chunk,
        },
      }),
    );

    // 使用Promise.allSettled处理部分失败的情况
    const results = await Promise.allSettled(requests);

    // 处理响应结果
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("请求失败:", result.reason);
        return;
      }

      //console.log(result)
      const response: any = result.value;
      if (response.status === "OK") {
        response.data.forEach((item: any) => {
          const dataItem = dataMap.get(item[0].toString());
          if (dataItem && item[1] === 77) {
            dataItem.name = item[3];
          }
        });
      } else {
        console.error(`请求失败, HTTP状态码, ${response.status}`);
      }
    });

    //console.log(dataCopy)

    // 更新状态（创建新数组触发重新渲染）
    data.value = [...dataCopy];

    const disabledKeys = dataCopy
      .filter((item) => item.disabled)
      .map((item) => item.key);
    selectedRowKeys.value = disabledKeys;
  } catch (error) {
    console.error("请求失败:", error);
    message.error(t("msg.read_points_error"));
  } finally {
    loading.value = false;
  }
};

const processDataChunks = (data: any[], CHUNK_SIZE: number): any[][] => {
  // 将数据分割成大小为 CHUNK_SIZE 的块
  const chunks = Array.from(
    { length: Math.ceil(data.length / CHUNK_SIZE) },
    (_, index) => data.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
  );

  // 处理每个块，生成 [key, objectName] 的扁平化数组
  return chunks.map((chunk) =>
    chunk.flatMap((item) => [item.key, ["objectName"]]),
  );
};

const handleOk = async () => {
  //console.log("selectedRowKeys", selectedRowKeys.value);
  if (selectedRowKeys.value.length === 0) {
    return;
  }

  try {
    const list = selectedRowKeys.value
      .map((key) => {
        if (selectedObjKeys.value.includes(String(key))) return null; // 跳过已选中的点位

        const record = data.value.find((item) => item.key === key);
        if (!record) return null;

        const type = record.type as keyof typeof jsonList;
        const proList = jsonList[type] ?? [];

        return {
          uid: `${getDeviceTypeId(record.type)},${record.id}`,
          name: record.name,
          description: "",
          property: {
            pro_list: proList,
          },
          tags: "",
          device_id: deviceInfo.value.key,
        };
      })
      .filter(Boolean);

    const res = await addSubscribePoint(list);

    if (res.status !== "OK") {
      console.warn("Non-OK response status:", res.status);
      message.error(t("msg.add_points_error"));
      return;
    }

    emit("onSaveSuccess");
  } catch (error) {
    console.error("Error handleOk data:", error);
    message.error(t("msg.add_points_error"));
  } finally {
    emit("update:modelShow", false);
  }
};

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);

  if (!newOpenState) {
  }
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
}
</style>
