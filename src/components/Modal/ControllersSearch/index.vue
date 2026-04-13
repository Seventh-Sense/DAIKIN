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
        <a-select
          v-model:value="selectInterface"
          :options="networkOptions"
          :placeholder="t('device_search.please_select_network_interface')"
          style="width: 200px"
        />
        <a-button
          type="primary"
          class="modal-btn"
          @click="onSearch"
          :loading="loading"
        >
          {{ t("device_search.search") }}
        </a-button>
      </div>
      <div class="modal-content">
        <a-table
          class="ant-table-striped"
          size="middle"
          :loading="loading"
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
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { FlowLite, FlowPro, FlowStandard } from "./optons";
import { useStepStore } from "@/pinia/modules/step";
import { routerTurnByName } from "../../../router/util";
import { getControllerList, getNetWorkInterfaces } from "@/api/modules/page";

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

const networkOptions = ref<any[]>([]);
const selectInterface = ref<string | undefined>(undefined);

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

//自动勾选逻辑
const autoCheckAddedRows = () => {
  // 数据为空时不执行
  if (data.value.length === 0) return;

  // 1. 获取已添加的地址列表
  const addedAddresses = getAddedAddresses().filter(Boolean);

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
  { title: t("device_search.version"), dataIndex: "version" },
]);
const loading = ref(false);
const data = ref<any>([]);

const typeMap: Record<string, string> = {
  "1": "pro",
  "2": "standard",
  "3": "lite",
};

const onSearch = async () => {
  data.value = [];

  try {
    loading.value = true;
    const productType = typeMap[props.type] || "pro";

    const result = await getControllerList({
      product_series: productType,
      timeout: 10,
      network_interface: selectInterface.value,
    });

    if (!result || !result.success) {
      message.error(t("device_search.request_failed"));
      return;
    }

    console.log("搜索控制器结果:", result);
    const { devices = [] } = result;

    if (devices.length === 0) {
      message.error(t("device_search.no_devices_found"));
      return;
    }

    data.value = devices.map((device: any, index: number) => ({
      key: device.device_address,
      name: device.device_model,
      slaveid: device.device_id,
      address: device.device_address,
      version: device.device_version,
    }));

    // 自动勾选
    autoCheckAddedRows();

    message.success(t("device_search.search_success"));
  } catch (error) {
    console.error("搜索控制器失败:", error);
    message.error(t("device_search.search_error"));
  } finally {
    loading.value = false;
  }
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
    const currentRawMenus: any = [...stepStore.rawMenus];

    const targetMenuIndex = currentRawMenus.findIndex(
      (menu: any) => menu.key === props.type,
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

        console.log("SelectedRows", item);
        const thirdLevelMenus = thirdLevelTemplate.map((third) => ({
          ...third,
          key: `${secondLevelKey}-${third.key}`,
        }));
        return {
          key: secondLevelKey,
          icon: "deviceA",
          label: item.address,
          data: {
            name: item.name,
            slaveid: item.slaveid,
            address: item.address,
            version: item.version,
          },
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
    gap: 12px;
  }

  &-content {
    height: 420px;
    width: 100%;
  }

  &-btn {
    height: 32px;
    min-width: 72px;
  }
}
</style>
