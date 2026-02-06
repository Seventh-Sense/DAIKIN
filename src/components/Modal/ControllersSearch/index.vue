<template>
  <a-modal
    :open="modelShow"
    @update:open="handleModalOpenChange"
    :title="t('device_search.title')"
    :width="1000"
    centered
    :maskClosable="false"
    :destroyOnClose="true"
    :okText="t('device_search.ok')"
    @ok="handleOk"
  >
    <div class="modal">
      <div class="modal-title">
        <a-button type="primary" class="modal-btn" @click="onSearch">
          {{ t("device_search.search") }}
        </a-button>
      </div>
      <div class="modal-content">
        <a-table
          class="ant-table-striped"
          size="middle"
          :scroll="{ y: 360 }"
          :pagination="false"
          :columns="columns"
          :data-source="data"
          :row-class-name="getRowClassName"
          :row-selection="{
            selectedRowKeys: selectedRowKeys,
            onChange: handleRowSelectChange,
            type: 'checkbox',
          }"
          :rowKey="(record: any) => record.key"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelShow"]);
const { t } = useI18n();

const selectedRowKeys = ref<string[]>([]); // 存储选中行的key
const selectedRows = ref<any[]>([]); // 存储选中行的完整数据

const columns = computed(() => [
  { title: t("device_search.name"), dataIndex: "name" },
  { title: t("device_search.slave_id"), dataIndex: "slaveid" },
  { title: t("device_search.address"), dataIndex: "address" },
  { title: t("device_search.slave_sn"), dataIndex: "slavesn" },
  { title: t("device_search.model"), dataIndex: "model" },
]);

const data = ref([
  {
    key: "1",
    name: "John Brown",
    slaveid: 32,
    address: "New York No. 1 Lake Park",
    slavesn: "asd",
    model: "asda",
  },
  {
    key: "2",
    name: "John Brown",
    slaveid: 32,
    address: "New York No. 1 Lake Park",
    slavesn: "asd",
    model: "asda",
  },
  {
    key: "3",
    name: "John Brown",
    slaveid: 32,
    address: "New York No. 1 Lake Park",
    slavesn: "asd",
    model: "asda",
  },
  {
    key: "4",
    name: "John Brown",
    slaveid: 32,
    address: "New York No. 1 Lake Park",
    slavesn: "asd",
    model: "asda",
  },
]);

const onSearch = () => {
  console.log("onSearch");
};

const getRowClassName = (_record: any, index: number) => {
  return index % 2 === 1 ? "table-striped" : "table-striped-1";
};

const handleModalOpenChange = (newOpenState: boolean) => {
  emit("update:modelShow", newOpenState);
};

const handleRowSelectChange = (keys: string[], rows: any[]) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

const handleOk = (e: MouseEvent) => {
    console.log("选中的行keys:", selectedRowKeys.value);
  if (selectedRowKeys.value.length > 0) {
    
    emit("update:modelShow", false);
  } else {
    message.warn('未选中数据!')
  }
  
};
</script>

<style lang="less" scoped>
.modal {
  width: 100%;
  height: 100%;
  padding: 0;

  &-title {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 48px;
    padding: 0 12px;
  }

  &-content {
    height: 420px;
    width: 100%;
  }

  &-btn {
    height: 32px;
    width: 72px;
  }
}
</style>
