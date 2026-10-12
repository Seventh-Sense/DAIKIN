# 分组（Group）从设备迁移到点位 - 实施计划

## Repository Research

### 当前 group 字段分布

**DeviceManage（设备管理）中 group 的使用位置：**

| 文件 | 使用方式 |
|------|----------|
| `DeviceManage/index.vue` (L159-165) | 表格中显示 `group` 列 |
| `DeviceManage/Modal/BACnetModal/index.vue` (L30-38) | 表单中有 group 输入（a-input-number, 范围1-10） |
| `DeviceManage/Modal/DeviceSetModal/index.vue` (L296) | initEditData 从 property 中读取 group |
| `DeviceManage/component/ModbusTCP/index.vue` | 表单中有 group 输入（a-input-number, 范围1-10） |
| `DeviceManage/component/ModbusRTU/index.vue` | 表单中有 group 输入（a-input-number, 范围1-10） |
| `DeviceManage/component/KNX/index.vue` | 表单中有 group 输入（a-input-number, 范围1-10） |
| `DeviceManage/component/BACnet/index.vue` (L219) | 默认数据中有 `group: ""` |
| `DeviceManage/utils/utils.ts` - createModbusTCPParams (L165) | 输出参数包含 `group: data.property.group` |
| `DeviceManage/utils/utils.ts` - createModbusRTUParams (L185) | 输出参数包含 `group: data.property.group` |
| `DeviceManage/utils/utils.ts` - createKNXParams (L207) | 输出参数包含 `group: data.property.group` |
| `DeviceManage/utils/utils.ts` - 默认数据 | ModbusTCPData/ModbusRTUData/KNXData 都有 `group: ""` |
| `DeviceManage/utils/utils.ts` - DEVICE_FIELD_CONFIG | 导出 Excel 时四种设备都包含 `group: device.group` |
| `DeviceManage/utils/utils.ts` - transformDeviceRow | 导入时解析 `group: row.group === "" ? 1 : Number(row.group)` |

**Points（点位）中 group 的使用情况：
- 所有点位相关文件 **均无** group 字段

### group 范围变更
- 原设备侧：a-input-number，范围 **1-10**
- 新点位侧：a-input-number，范围 **1-32**（用户指定）

**MQTT 模块中 group 的使用位置（关键！需要迁移数据源）：**

| 文件 | 使用方式 |
|------|----------|
| `MQTT/MqttConfigForm.vue` (L251-256) | 从 **devices** 数组提取不重复的 group 值作为 Topic serial_number 下拉选项 |
| `MQTT/TopicModal/index.vue` (L81) | 对比已选 Topic 的 `group` 字段来过滤可用选项 |
| `MQTT/TopicModal/index.vue` (L115) | 新建 Topic 时将 serial_number 赋值给 `group` 字段 |
| `MQTT/TopicCard/index.vue` (L4, L117) | 用 Topic 的 `group` 作为卡片标题 "Group-{{ cardName }}" |

**MQTT 当前数据流：**
```
devices[].group → 提取不重复值 → 作为 Topic 的 serial_number 选项 → Topic.group
```

**MQTT 目标数据流：**
```
devices[].points[].group → 提取不重复值 → 作为 Topic 的 serial_number 选项 → Topic.group
```

### 数据模型

**当前结构：**
```
Device {
  uid, device_name, protocol, sn, pkey, group, polling, address, description, enabled,
  property: { ...协议特定字段, group },
  points: [ Point ]
}

Point {
  uid, point_name, m, dev, description, writable,
  property: { ...协议特定字段 }
}

MQTT Topic {
  group: <来自设备的 group 值>,
  serial_number: <同 group>,
  sub_topic, pub_topic, interval, sn, pkey
}
```

**目标结构：**
```
Device {
  uid, device_name, protocol, sn, pkey, polling, address, description, enabled,
  property: { ...协议特定字段 },  // 不再有 group
  points: [ Point ]
}

Point {
  uid, point_name, m, dev, description, writable, group,  // 新增 group
  property: { ...协议特定字段 }
}

MQTT Topic {
  group: <来自点位的 group 值>,  // 数据源变更
  serial_number: <同 group>,
  sub_topic, pub_topic, interval, sn, pkey
}
```

## Files and Modules

### 第一部分：DeviceManage - 删除 group 相关

| 文件 | 变更内容 |
|------|----------|
| `DeviceManage/index.vue` | columns 数组中删除 group 列（L159-165） |
| `DeviceManage/Modal/BACnetModal/index.vue` | 删除 group 的 a-input-number 表单项（L30-38）；删除 data 初始化中的 group（L123）；删除 initFormData 中的 group（L160） |
| `DeviceManage/component/ModbusTCP/index.vue` | 删除 group 的 a-input-number 表单项 |
| `DeviceManage/component/ModbusRTU/index.vue` | 删除 group 的 a-input-number 表单项 |
| `DeviceManage/component/KNX/index.vue` | 删除 group 的 a-input-number 表单项 |
| `DeviceManage/component/BACnet/index.vue` | 删除默认数据中的 group 字段 |
| `DeviceManage/Modal/DeviceSetModal/index.vue` | initEditData 中删除 property.group 读取（L296） |
| `DeviceManage/utils/utils.ts` | 1) 删除 createModbusTCPParams/createModbusRTUParams/createKNXParams 中的 `group` 输出<br>2) 删除 ModbusTCPData/ModbusRTUData/KNXData 默认数据中的 `group: ""`<br>3) 删除 DEVICE_FIELD_CONFIG 四种设备导出中的 `group: device.group`<br>4) 修改 transformDeviceRow：删除 group 处理 |

### 第二部分：Points - 新增 group 相关

| 文件 | 变更内容 |
|------|----------|
| `Points/index.vue` | columns 数组中新增 group 列（位置建议在 description 之后） |
| `Points/ModbusPointModal/index.vue` | defaultData 新增 `group` 字段；表单 v-for 中新增 group 的 a-input-number（范围 **1-32**）；addNewPoint/addNewPoints 提交参数中新增 `group`；编辑初始化时从 editData.group 回填 |
| `Points/KNXPointModal/index.vue` | defaultData 新增 `group` 字段；表单新增 group 输入（a-input-number, **1-32**）；addNewPoint 提交参数新增 `group`；编辑初始化时回填 |
| `Points/BACnetPointModal/index.vue` | 批量添加点位时 newPoints 中新增 `group` 字段（默认为空或 1，用户后续编辑） |
| `Points/BACnetDisplayModal/index.vue` | 编辑表单中新增 group 输入；提交时处理 group |

### 第三部分：MQTT - 数据源从设备改为点位

| 文件 | 变更内容 |
|------|----------|
| `MQTT/MqttConfigForm.vue` (L251-256) | 修改 options 提取逻辑：从所有 devices 的 **points** 中收集 group 值，而非从 devices 自身 |

**当前代码：**
```ts
const { devices } = controllerData;
if (devices?.length) {
  options.value = [...new Set(devices.map((item) => item.group))].map(
    (group) => ({ value: group }),
  );
}
```

**改为：**
```ts
const { devices } = controllerData;
if (devices?.length) {
  const allGroups = devices.flatMap((device) => 
    (device.points || []).map((point) => point.group)
  ).filter((g) => g != null && g !== "");
  options.value = [...new Set(allGroups)].map((group) => ({ value: group }));
}
```

### 第四部分：导出导入 - 点位增加 group

| 文件 | 变更内容 |
|------|----------|
| `DeviceManage/utils/utils.ts` | 1) POINT_FIELD_CONFIG 四种点位导出中新增 `group: point.group`<br>2) transformPointRow 中新增 group 解析 |

## Implementation Steps

1. **删除设备侧的 group**（共 8 个文件）
   - DeviceManage/index.vue: 删除表格 group 列
   - BACnetModal: 删除 group 表单、data 初始化、initFormData
   - ModbusTCP/ModbusRTU/KNX component: 删除 group 表单
   - BACnet component: 删除默认数据 group
   - DeviceSetModal: 删除 initEditData 中 group 读取
   - utils.ts: 删除 3 个 createParams 中的 group 输出、3 个默认数据的 group、DEVICE_FIELD_CONFIG 的 group、transformDeviceRow 的 group

2. **新增点位侧的 group**（共 6 个文件）
   - Points/index.vue: 新增表格 group 列
   - ModbusPointModal: defaultData + 表单 + 提交 + 编辑回填
   - KNXPointModal: 同上
   - BACnetPointModal: 批量添加带 group
   - BACnetDisplayModal: 编辑表单 + 提交

3. **修改 MQTT 数据源**（1 个文件）
   - MqttConfigForm.vue: options 从 devices[].points[].group 提取

4. **修改 Excel 导出导入**（utils.ts 继续修改）
   - POINT_FIELD_CONFIG: 四种点位新增 group 导出
   - transformPointRow: 新增 group 解析

## Dependencies and Considerations

- **分组范围**：点位侧保持 a-input-number，范围 **1-32**（用户指定）
- **BACnet 批量添加**：没有逐个设置界面，给默认值 1 或让用户后续编辑
- **MQTT Topic 的 group 字段**：存储结构不变（仍为 topic.group），只是选项来源变了

## Validation

- [ ] 设备管理页面表格不再显示 group 列
- [ ] 设备的新增/编辑弹窗不再有 group 输入
- [ ] 点位管理页面表格新增 group 列
- [ ] 点位的新增/编辑弹窗有 group 输入（a-input-number, 1-32）
- [ ] BACnetDisplayModal 编辑弹窗有 group 输入
- [ ] MQTT 配置页面 Topic 的 serial_number 下拉选项来自点位的 group 值
- [ ] Excel 导出：设备表无 group 列，点位表有 group 列
- [ ] Excel 导入：点位的 group 字段正确解析

## Risks

- **风险1**：现有数据迁移 - 已有的 group 值都存在设备上，点位上没有
  - 处理：可以考虑从父设备继承 group 值给它的所有点位，或让用户重新设置
- **风险2**：Excel 格式变更 - 旧模板设备表有 group、点位表没有，新模板相反
  - 处理：导入时兼容两种格式（设备表如果有 group 列则忽略，点位表如果没有则默认）
- **风险3**：MQTT Topic 兼容性 - 现有已保存的 MQTT Topic 的 group 值如果来自旧设备，迁移后这些 group 值仍在，但下拉选项只显示点位中存在的 group
  - 处理：MQTT 加载时已保存的 topics 不受影响，但新增 Topic 只能选点位中实际存在的 group
