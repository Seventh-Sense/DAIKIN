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
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { FlowLite, FlowPro, FlowStandard } from "./optons";
import { useStepStore } from "@/pinia/modules/step";
import { routerTurnByName } from "../../../router/util";

const props = defineProps({
  modelShow: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelShow"]);

const { t } = useI18n();
const stepStore = useStepStore();

const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);

//自动勾选逻辑
const autoCheckAddedRows = () => {
  // 数据为空时不执行
  if (data.value.length === 0) return;

  // 1. 获取已添加的地址列表
  const addedAddresses = getAddedAddresses();
  // 2. 匹配已添加的行并勾选
  const matchedKeys = data.value
    .filter((item: any) => addedAddresses.includes(item.address))
    .map((item: any) => item.key);

  selectedRowKeys.value = matchedKeys;
  selectedRows.value = data.value.filter((item: any) =>
    matchedKeys.includes(item.key),
  );
};

//获取已添加的地址列表
const getAddedAddresses = () => {
  const targetMenu = stepStore.rawMenus.find(
    (menu: any) => menu.key === props.type,
  );
  if (!targetMenu || !targetMenu.children) return [];

  return targetMenu.children.map((subMenu: any) => subMenu.label);
};

const generateUniqueKey = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000).toString(16);
  // 拼接结果示例："11234567890abcdef"（无任何 '-'）
  return `${timestamp}${random}`;
};

const columns = computed(() => [
  { title: t("device_search.name"), dataIndex: "name" },
  { title: t("device_search.slave_id"), dataIndex: "slaveid" },
  { title: t("device_search.address"), dataIndex: "address" },
  { title: t("device_search.slave_sn"), dataIndex: "slavesn" },
  { title: t("device_search.model"), dataIndex: "model" },
]);

const data = ref<any>([]);

const onSearch = () => {
  console.log("onSearch");
  data.value = [
    {
      key: "1",
      name: "John Brown",
      slaveid: 32,
      address: "192.168.1.1",
      slavesn: "asd",
      model: "asda",
    },
    {
      key: "2",
      name: "John Brown",
      slaveid: 32,
      address: "192.168.1.2",
      slavesn: "asd",
      model: "asda",
    },
    {
      key: "3",
      name: "John Brown",
      slaveid: 32,
      address: "192.168.1.3",
      slavesn: "asd",
      model: "asda",
    },
    {
      key: "4",
      name: "John Brown",
      slaveid: 32,
      address: "192.168.1.4",
      slavesn: "asd",
      model: "asda",
    },
  ];

  // 数据加载完成后，执行自动勾选逻辑
  autoCheckAddedRows();
};

const getRowClassName = (_record: any, index: number) => {
  return index % 2 === 1 ? "table-striped" : "table-striped-1";
};

//只在取消按钮和右上角关闭时触发
const handleModalOpenChange = (newOpenState: boolean) => {
  if (!newOpenState) {
    selectedRowKeys.value = [];
    selectedRows.value = [];
    data.value = [];
  }

  //console.log("handleModalOpenChange", newOpenState);
  emit("update:modelShow", newOpenState);
};

const handleRowSelectChange = (keys: string[], rows: any[]) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

const handleOk = (e: MouseEvent) => {
  e.preventDefault();
  //console.log("选中的行keys:", selectedRowKeys.value, props.type);

  try {
    const currentRawMenus = [...stepStore.rawMenus];

    const targetMenuIndex = currentRawMenus.findIndex(
      (menu) => menu.key === props.type,
    );

    // 1. 获取已添加地址、当前搜索结果的地址、当前勾选地址
    const addedAddresses = getAddedAddresses();
    const searchResultAddresses = data.value.map((item: any) => item.address);
    const selectedAddresses = selectedRows.value.map((item) => item.address);

    // 2. 关键判断：当前搜索结果中是否包含已添加的地址（交集）
    const hasAddedInSearch = addedAddresses.some((addr: any) =>
      searchResultAddresses.includes(addr),
    );

    let deleteCount = 0;
    // 仅当「搜索结果包含已添加地址」时，才执行删除逻辑
    if (hasAddedInSearch) {
      // 找出需要删除的地址：已添加+在当前搜索结果中+当前未勾选
      const needDeleteAddresses = addedAddresses.filter(
        (addr: any) =>
          searchResultAddresses.includes(addr) &&
          !selectedAddresses.includes(addr),
      );
      deleteCount = needDeleteAddresses.length;
      // 执行删除
      if (deleteCount > 0) {
        currentRawMenus[targetMenuIndex].children = currentRawMenus[
          targetMenuIndex
        ].children.filter(
          (subMenu: any) => !needDeleteAddresses.includes(subMenu.label),
        );
      }
    }

    // 2. 过滤选中行中未添加过的地址（去重）
    const newSelectedRows = selectedRows.value.filter(
      (item) => !addedAddresses.includes(item.address),
    );

    const addCount = newSelectedRows.length;
    if (addCount > 0) {
      const newSubMenus = newSelectedRows.map((item, index) => {
        const secondLevelKey = `${props.type}-${generateUniqueKey()}`;
        const thirdLevelTemplate =
          props.type === "1"
            ? FlowPro
            : props.type === "2"
              ? FlowStandard
              : FlowLite;
        const thirdLevelMenus = thirdLevelTemplate.map((third) => ({
          ...third,
          key: `${secondLevelKey}-${third.key}`,
        }));
        return {
          key: secondLevelKey,
          icon: "deviceA",
          label: item.address,
          children: thirdLevelMenus,
        };
      });
      currentRawMenus[targetMenuIndex].children = [
        ...currentRawMenus[targetMenuIndex].children,
        ...newSubMenus,
      ];
    }

    const tipMessage = computed(() => {
      if (deleteCount > 0 && addCount > 0) {
        return t("device_search.msg_8", {
          delnum: deleteCount,
          addnum: addCount,
        });
      } else if (deleteCount > 0) {
        return t("device_search.msg_9", { delnum: deleteCount });
      } else if (addCount > 0) {
        return t("device_search.msg_10", { addnum: addCount });
      } else {
        return t("device_search.msg_2");
      }
    });

    stepStore.updateRawMenus(currentRawMenus);

    if (deleteCount > 0) {
      handlePageRedirectAfterDelete();
    }

    message.success(tipMessage.value);
    emit("update:modelShow", false);
  } catch (error) {
    console.error("更新菜单失败:", error);
    message.error(t("device_search.msg_1"));
  }
};

//从三级菜单key中提取二级菜单key
const extractSecondLevelKey = (fullKey: string): string => {
  if (!fullKey || !fullKey.includes("-")) return "";
  const keyParts = fullKey.split("-");
  if (keyParts.length < 2) return "";
  return keyParts.slice(0, 2).join("-");
};

//递归检查菜单key是否存在
const checkMenuKeyExists = (menus: any[], key: string): boolean => {
  for (const menu of menus) {
    if (menu.key === key) {
      return true;
    }
    if (menu.children && menu.children.length > 0) {
      const exists = checkMenuKeyExists(menu.children, key);
      if (exists) {
        return true;
      }
    }
  }
  return false;
};

const handlePageRedirectAfterDelete = () => {
  // 获取当前选中的三级菜单key
  const currentSelectedKey = stepStore.menuSelectedKeys[0];

  // 如果没有选中的key，直接返回
  if (!currentSelectedKey) return;

  // 1. 提取二级菜单key
  const secondLevelKey = extractSecondLevelKey(currentSelectedKey);
  if (!secondLevelKey) return;

  // 2. 检查该二级菜单是否还存在
  const secondLevelExists = checkMenuKeyExists(
    stepStore.rawMenus,
    secondLevelKey,
  );

  // 3. 如果二级菜单不存在，跳转到首页
  if (!secondLevelExists) {
    // 重置菜单状态
    stepStore.updateMenuSelectedKeys([]);
    stepStore.updateMenuOpenKeys([]);
    stepStore.updateCurrentStep("");

    routerTurnByName("Home", false, false);
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
