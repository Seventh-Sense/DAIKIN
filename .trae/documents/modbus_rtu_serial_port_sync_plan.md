# ModbusRTU 串口参数按控制器隔离映射实施计划

## 需求理解（已确认）

- ModbusRTU 有 4 个串口值：Modbus1 / Modbus2 / Modbus3 / Modbus4
- **按控制器隔离**：每个控制器（按 IP）有独立的一套 `{Modbus1→参数, Modbus2→参数, ...}` 映射，不同控制器之间互不影响
- **控制器内唯一**：同一控制器下所有 ModbusRTU 设备的同一串口参数保持一致
- **仅保存时同步**：**只有在 DeviceSetModal 点击"确定"保存设备时**，才会同步 modbusConfig store 和 controllerMap 全量对齐
- **编辑期间只读 store**：在 DeviceSetModal 里编辑设备时，串口参数（baudrate/data_bit/parity/stop_bit）**只从 store 读取**（onMounted、切换串口时），不实时写 store
- ConnectCheck 的 `generateConfigZipFile` 直接打 controllerMap 即可，无需额外对齐逻辑

## 现状分析

### 当前问题
```
（同一控制器内）
设备 A: serial_port=Modbus1, baudrate=38400  ← 各自独立
设备 B: serial_port=Modbus1, baudrate=9600   ← 可以不一致（不应该）

→ DeviceSetModal 保存设备 A → 只更新 controllerMap 里的设备 A
→ controllerMap 里设备 B 的 baudrate 还是 9600（旧值）
→ ConnectCheck 上传 → generateConfigZipFile 直接打 → 矛盾配置 ❌
```

### 数据流目标
```
【页面初始化】
  controllerMap.devices → initData → restoreFromDevices → 回填 modbusConfig store
  store 成为每个控制器的串口参数权威源

【打开 DeviceSetModal（新建或编辑）】
  DeviceSetModal 的 initEditData / defaultProperty → props.data.property
  → ModbusRTU 组件 onMounted：不做任何覆盖，表单显示初始值（编辑=设备原始值，新建=默认值）

【用户操作期间】
  用户改 serial_port（比如从 Modbus1 切到 Modbus2）
  → watch serial_port 触发（排除首次）→ applyParamsFromStore("Modbus2")
  → 表单从 store 加载 Modbus2 的权威参数 ✅

  用户改 baudrate / data_bit / parity / stop_bit
  → 只在表单本地变化 → store 不动 ❌

【点击 DeviceSetModal "确定"（★ 唯一同步时机）】
  1. 从当前表单读参数（serial_port + baudrate + data_bit + parity + stop_bit）
  2. modbusConfigStore.updatePortParams(ip, serial_port, params)  // 更新 store
  3. controllerStore.addDeviceToController(ip, device)              // 保存当前设备
  4. modbusConfigStore.syncToControllerMap(ip)                     // store → controllerMap 全量覆盖
     → controllerMap 中所有 ModbusRTU 设备按 serial_port 从 store 取参数
     → 设备 A、设备 B（同 Modbus1）的 baudrate 全部一致 ✅

【ConnectCheck "下载文件"】
  controllerMap 已完全一致 → generateConfigZipFile → 上传 → 统一配置 ✅
```

### 项目基础
- Pinia + `pinia-plugin-persistedstate` 持久化到 localStorage
- `controllerMap` 已持久化，`initData()` 从 `getControllerDevices(ip)` 按 IP 加载
- `stepStore.getCurrentIP()` 返回当前控制器 IP（`currentMenuData.label`）
- `handleSubmitByType`（DeviceSetModal）→ `controllerStore.addDeviceToController(ip, params)` 保存设备

## 方案设计

### 1. 新建 Pinia store：`src/pinia/modules/modbusConfig.ts`

```ts
import { defineStore } from "pinia";
import { DeviceTypeEnum } from "@/views/Flows/DeviceManage/utils/options";
import { useControllerStore } from "./controller";

export interface PortParams {
  baudrate: number;
  data_bit: number;
  parity: string;
  stop_bit: number;
}

const DEFAULT_PARAMS: PortParams = {
  baudrate: 38400,
  data_bit: 8,
  parity: "N",
  stop_bit: 1,
};

const ALL_PORTS = ["Modbus1", "Modbus2", "Modbus3", "Modbus4"] as const;

type PortMap = Record<string, PortParams>;

function createDefaultMap(): PortMap {
  return ALL_PORTS.reduce((acc, port) => {
    acc[port] = { ...DEFAULT_PARAMS };
    return acc;
  }, {} as PortMap);
}

export const useModbusConfigStore = defineStore("modbusConfig", {
  state: () => ({
    // 按控制器 IP 隔离：每个 IP 独立的串口参数映射
    controllerPortMaps: {} as Record<string, PortMap>,
  }),
  actions: {
    // 获取指定控制器 + 串口的参数（编辑时读取）
    getPortParams(ip: string, portName: string): PortParams {
      const map = this.controllerPortMaps[ip];
      if (!map) return { ...DEFAULT_PARAMS };
      return map[portName] ?? { ...DEFAULT_PARAMS };
    },
    // 更新指定控制器 + 串口的参数（仅保存时调用）
    updatePortParams(ip: string, portName: string, params: Partial<PortParams>) {
      if (!this.controllerPortMaps[ip]) {
        this.controllerPortMaps[ip] = createDefaultMap();
      }
      this.controllerPortMaps[ip][portName] = {
        ...this.controllerPortMaps[ip][portName],
        ...params,
      };
    },
    // 从设备列表回填（页面初始化时）
    restoreFromDevices(ip: string, devices: any[]) {
      if (!this.controllerPortMaps[ip]) {
        this.controllerPortMaps[ip] = createDefaultMap();
      }
      devices?.forEach((device) => {
        if (device.protocol !== DeviceTypeEnum.ModbusRTU) return;
        const prop = device.property;
        if (!prop?.serial_port) return;
        if (prop.baudrate == null) return;
        this.updatePortParams(ip, prop.serial_port, {
          baudrate: prop.baudrate,
          data_bit: prop.data_bit,
          parity: prop.parity,
          stop_bit: prop.stop_bit,
        });
      });
    },
    // ★ 仅保存时调用：把 store 里的参数全量写回 controllerMap
    syncToControllerMap(ip: string) {
      const controllerStore = useControllerStore();
      const controller = controllerStore.getControllerByIp(ip);
      if (!controller?.devices?.length) return;

      const portMap = this.controllerPortMaps[ip];
      if (!portMap) return;

      controller.devices.forEach((device: any) => {
        if (device.protocol !== DeviceTypeEnum.ModbusRTU) return;
        const prop = device.property;
        if (!prop?.serial_port) return;
        const params = portMap[prop.serial_port];
        if (!params) return;
        prop.baudrate = params.baudrate;
        prop.data_bit = params.data_bit;
        prop.parity = params.parity;
        prop.stop_bit = params.stop_bit;
      });
      // controllerMap 是 Pinia ref，修改自动触发持久化
    },
    // 清理（删除控制器时）
    clearByIp(ip: string) {
      delete this.controllerPortMaps[ip];
    },
  },
  persist: {
    key: "modbus_config",
    storage: localStorage,
  },
});
```

### 2. 修改 DeviceManage/index.vue：初始化回填

```ts
// import 新增
import { useModbusConfigStore } from "@/pinia/modules/modbusConfig";
const modbusConfigStore = useModbusConfigStore();

// initData 修改
const initData = async () => {
  loading.value = true;
  data.value = controllerStore.getControllerDevices(currentIP);

  // 按当前控制器 IP 回填 store
  modbusConfigStore.restoreFromDevices(currentIP, data.value);

  loading.value = false;
};
```

### 3. 修改 ModbusRTU/index.vue：新建时从 store 加载，编辑时保留原始值，切换串口时加载

```ts
import { useStepStore } from "@/pinia/modules/step";
import { useModbusConfigStore } from "@/pinia/modules/modbusConfig";

const stepStore = useStepStore();
const modbusConfigStore = useModbusConfigStore();

// 当前控制器 IP
const currentControllerIP = stepStore.getCurrentIP();

// 从 store 加载指定串口的参数到表单
const applyParamsFromStore = (portName: string) => {
  // getPortParams 内部已处理：store 没有时返回 DEFAULT_PARAMS
  const params = modbusConfigStore.getPortParams(currentControllerIP, portName);
  const p = props.data.property;
  p.baudrate = params.baudrate;
  p.data_bit = params.data_bit;
  p.parity = params.parity;
  p.stop_bit = params.stop_bit;
};

onMounted(() => {
  // ★ 新建设备（isEdit=false）：当前 serial_port（默认 Modbus1）从 store 加载
  //   store 有值 → 加载 store 里的参数；store 没值 → getPortParams 返回 DEFAULT_PARAMS（38400/8/N/1）
  // ★ 编辑设备（isEdit=true）：不覆盖，保留 controllerMap 里的设备原始值
  if (!props.isEdit) {
    const portName = props.data.property.serial_port;
    if (portName) {
      applyParamsFromStore(portName);
    }
  }
});

// ★ 切换串口时（新建和编辑都触发），从 store 加载该串口的参数
watch(
  () => props.data.property.serial_port,
  (newPort, oldPort) => {
    if (!newPort) return;
    // 排除首次触发（组件初始化时 onMounted 已处理过）
    if (oldPort === undefined) return;
    if (newPort === oldPort) return;
    applyParamsFromStore(newPort);
  }
);

// ★ 没有 watch 参数变化写 store 的逻辑！
// 编辑期间 baudrate/data_bit/parity/stop_bit 的变化只在表单本地
// 只有点击 DeviceSetModal "确定"时才统一同步
```

### 4. ★ 关键修改：DeviceSetModal/index.vue — 保存时全量同步，取消时不动

在 `handleSubmitByType` 中，ModbusRTU 设备保存时先更新 store，再全量对齐 controllerMap：

```ts
// 新增 import
import { useModbusConfigStore } from "@/pinia/modules/modbusConfig";

// 组件 setup 内新增
const modbusConfigStore = useModbusConfigStore();

// 修改 handleSubmitByType（仅 ModbusRTU 新增同步逻辑）
const handleSubmitByType = async (data: DataType) => {
  let params;
  switch (data.type) {
    case DeviceTypeEnum.ModbusTCP:
      params = createModbusTCPParams(data);
      break;
    case DeviceTypeEnum.ModbusRTU:
      params = createModbusRTUParams(data);
      break;
    case DeviceTypeEnum.KNX:
      params = createKNXParams(data);
      break;
    default:
      return;
  }

  const ip = stepStore.getCurrentIP();

  // ★ 如果是 ModbusRTU，先更新 store（以本次编辑的参数为准）
  if (data.type === DeviceTypeEnum.ModbusRTU) {
    const prop = params.property;
    modbusConfigStore.updatePortParams(ip, prop.serial_port, {
      baudrate: prop.baudrate,
      data_bit: prop.data_bit,
      parity: prop.parity,
      stop_bit: prop.stop_bit,
    });
  }

  // 保存当前设备到 controllerMap
  controllerStore.addDeviceToController(ip, params);

  // ★ 如果是 ModbusRTU，store → controllerMap 全量对齐
  if (data.type === DeviceTypeEnum.ModbusRTU) {
    modbusConfigStore.syncToControllerMap(ip);
  }

  // ... 后续不变（message、emit onSaveSuccess、onClose）
};
```

**取消逻辑（无需新增代码，现有逻辑已正确）**：

```
a-modal 的"取消"按钮 / 点击遮罩 / handleModalOpenChange(false)
  → resetForm() 清空表单
  → emit("update:modelShow", false) 关闭弹窗
  → ★ 不触发 handleSubmitByType → store 和 controllerMap 完全不动 ✅
  → 下次打开设备 → 还是原来的值
```

现有代码 `handleModalOpenChange` 和 `onClose` 只做 resetForm + emit close，没有任何 store 或 controllerMap 操作，天然满足"取消不生效"的需求。

## 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/pinia/modules/modbusConfig.ts` | **新建** | 按控制器 IP 隔离的串口参数 store，核心数据结构 `controllerPortMaps: Record<string, PortMap>`。方法：`restoreFromDevices`、`updatePortParams`、`syncToControllerMap` |
| `src/views/Flows/DeviceManage/index.vue` | **修改** | `initData()` 加载当前控制器设备后，调用 `restoreFromDevices(currentIP, data.value)` 初始化 store |
| `src/views/Flows/DeviceManage/component/ModbusRTU/index.vue` | **修改** | 引入 stepStore + modbusConfigStore，onMounted 从 store 加载，watch serial_port 切换加载。**编辑期间不写 store** |
| `src/views/Flows/DeviceManage/Modal/DeviceSetModal/index.vue` | **修改** | 引入 modbusConfigStore，ModbusRTU 设备保存时：① updatePortParams 更新 store ② addDeviceToController 保存设备 ③ syncToControllerMap 全量对齐 controllerMap |

**不修改**：ConnectCheck、utils.ts、options.ts、controller.ts、后端接口、BACnetModal。

## 场景详解

### 场景 1：页面初始化，从已保存设备恢复 store

```
（控制器 IP = 192.168.1.100）

controllerMap["192.168.1.100"].devices：
  设备 A → {protocol:"ModbusRTU", serial_port:"Modbus1", baudrate:9600, ...}
  设备 B → {protocol:"ModbusRTU", serial_port:"Modbus2", baudrate:19200, ...}

initData() → restoreFromDevices → store.controllerPortMaps["192.168.1.100"] 完成
  store["192.168.1.100"]["Modbus1"] = {baudrate:9600, ...}
  store["192.168.1.100"]["Modbus2"] = {baudrate:19200, ...}
```

### 场景 2：新建 ModbusRTU 设备 → 默认串口从 store 加载

```
新建设备 → DeviceSetModal（isEdit=false）→ 选类型为 ModbusRTU
  → defaultProperty 填充：serial_port 默认 "Modbus1", baudrate:38400, ...
  → ModbusRTU 组件 onMounted：props.isEdit=false → 从 store 加载
     store["192.168.1.100"]["Modbus1"] = {baudrate:9600, ...}（场景 1 已回填）
     → 表单 baudrate 变成 9600 ✅（store 有值则覆盖默认值）

用户把 serial_port 改成 Modbus2
  → watch serial_port 触发（oldPort="Modbus1", newPort="Modbus2"）
  → applyParamsFromStore("Modbus2")
  → 表单 baudrate 变成 19200 ✅（store 有 Modbus2 的值）

用户又改成 Modbus3（store 还没有 Modbus3 的值）
  → watch 触发 → applyParamsFromStore("Modbus3")
  → getPortParams 返回 DEFAULT_PARAMS → baudrate=38400 ✅（store 没值则用默认）

用户点"确定" → 三步同步 → store + controllerMap 全部一致 ✅
```

### 场景 3：编辑已有设备 → 展示原始值，切串口才加载

```
编辑设备 A（controllerMap 中 serial_port=Modbus1, baudrate=9600）
  → DeviceSetModal initEditData → props.data.property.baudrate = 9600
  → ModbusRTU 组件 onMounted：不覆盖 → 表单显示 9600（设备自身值）✅

用户把 serial_port 改成 Modbus2
  → watch 触发 → applyParamsFromStore("Modbus2")
  → 表单 baudrate 变成 19200（store 里 Modbus2 的值）✅

用户又切回 Modbus1
  → watch 触发 → applyParamsFromStore("Modbus1")
  → 表单 baudrate 变成 9600（store 里 Modbus1 的值）✅
```

### 场景 4：点击"确定" → store + controllerMap 全量同步（核心场景）

```
（控制器 192.168.1.100，设备 A 和设备 B 都选 Modbus1）

编辑设备 A → 改 baudrate=57600 → 点击"确定"
  1. createModbusRTUParams → params.property.baudrate = 57600
  2. modbusConfigStore.updatePortParams(ip, "Modbus1", {baudrate:57600, ...})
     → store["192.168.1.100"]["Modbus1"] = {baudrate:57600, ...} ✅
  3. controllerStore.addDeviceToController(ip, params)
     → controllerMap 中设备 A 的 baudrate = 57600 ✅
  4. modbusConfigStore.syncToControllerMap(ip)
     → 遍历 controllerMap.devices 中所有 ModbusRTU
     → 设备 A 的 Modbus1 ← store 取 → 57600 ✅
     → 设备 B 的 Modbus1 ← store 取 → 57600 ✅（被同步！）

→ 打开设备 B（同 Modbus1）→ baudrate 显示 57600 ✅
→ ConnectCheck 上传 → controllerMap 里全是 57600 → 统一配置 ✅
```

### 场景 5：取消编辑 → store 和 controllerMap 都不变

```
编辑设备 A（Modbus1, 9600）→ 改成 57600 → 切到 Modbus2 → 改成 115200 → 点击取消
  → 不触发 handleSubmitByType
  → store 完全没变 ✅
  → controllerMap 完全没变 ✅
  → 下次打开设备 A → 还是原来的值 ✅
```

### 场景 6：多控制器隔离

```
控制器 A (192.168.1.100) → Modbus1 = {baudrate:9600}
控制器 B (192.168.1.101) → Modbus1 = {baudrate:19200}

store（持久化后）：
{
  "controllerPortMaps": {
    "192.168.1.100": { Modbus1: {baudrate:9600}, ... },
    "192.168.1.101": { Modbus1: {baudrate:19200}, ... }
  }
}

→ 切换到 A → 新建设备选 Modbus1 → 切到 Modbus2（store 有值则加载）✅
→ 切换到 B → 新建设备选 Modbus1 → 切到 Modbus2（store 有值则加载）✅
→ 互不干扰 ✅
```

## 实施步骤

1. **新建** `src/pinia/modules/modbusConfig.ts` — store + persist + `controllerPortMaps` + `restoreFromDevices` + `updatePortParams` + `syncToControllerMap`
2. **修改** `DeviceManage/index.vue` — import store，initData 中调用 `restoreFromDevices(currentIP, data.value)`
3. **修改** `ModbusRTU/index.vue` — import stepStore + modbusConfigStore。新建时（isEdit=false）onMounted 从 store 加载默认串口参数；编辑时（isEdit=true）onMounted 不覆盖，保留设备原始值；watch serial_port 切换时从 store 加载。**不加 watch 参数变化写 store**
4. **修改** `DeviceSetModal/index.vue` — import modbusConfigStore，ModbusRTU 保存时依次：updatePortParams → addDeviceToController → syncToControllerMap

## 风险与处理

| 风险 | 处理 |
|------|------|
| 历史脏数据（同控制器同串口参数不一致） | restoreFromDevices 以最后遍历的设备为准；第一次保存任意 ModbusRTU 设备时 syncToControllerMap 统一对齐 |
| 保存流程被中断（updatePortParams 后 addDeviceToController 失败） | store 已更新但 controllerMap 没同步 → 下次 initData 会从 controllerMap 回填覆盖 store。Pinia 同步操作，实际中断概率极低 |
| import 导入设备后 store 未更新 | handleFileUpload → initData → restoreFromDevices 自动回填 ✅ |
| 控制器切换时 store 串数据 | 所有 store 访问带 currentIP，天然隔离 ✅ |
| `stepStore.getCurrentIP()` 返回空 | syncToControllerMap("") 会影响 key="" 的控制器，但 IP 为空时页面也无法正常工作 |

## 验证方式

1. **初始化恢复**：保存设备 A（Modbus1, 9600）和设备 B（Modbus2, 19200）→ 刷新 → store 已回填 ✅
2. **编辑展示原始值**：打开设备 A（isEdit=true）→ 表单直接显示 controllerMap 里的原始值，不被 store 覆盖 ✅
3. **新建时 store 加载**：新建设备（isEdit=false）→ 默认 Modbus1 → onMounted 自动从 store 加载 → baudrate=9600 ✅；如果 store 没值则显示默认 38400 ✅
4. **切换串口从 store 加载**：新建/编辑时切 Modbus1→Modbus2 → baudrate 自动变成 store 里 Modbus2 的值 ✅；切到 store 没有的 Modbus3 → 显示默认值 ✅
5. **保存时全量对齐**（核心）：
   - 设备 A（Modbus1）= 9600 → 编辑改成 57600 → 确定
   - 打开设备 B（同 Modbus1）→ baudrate 也变成 57600 ✅
   - 刷新页面 → 设备 B 的 baudrate 仍是 57600 ✅
6. **取消不生效**：编辑改值 → 关闭弹窗不保存 → 重新打开 → 还是原值 ✅
7. **多控制器隔离**：控制器 A Modbus1=9600，控制器 B Modbus1=19200 → 切换互不影响 ✅
8. **ConnectCheck 上传**：保存后直接进 ConnectCheck → 上传 → 无矛盾配置 ✅
