import { message } from "ant-design-vue";
import * as XLSX from "xlsx";

/**
 * 工作表配置项
 * @template T 数据项类型
 */
export interface SheetConfig<T = any> {
  /** 工作表数据 */
  data: T[];
  /** 工作表名称（默认 Sheet + 索引） */
  sheetName?: string;
  /** 自定义格式化函数（可选，用于处理数据项） */
  formatter?: (item: T) => T;
}

/**
 * 导出Excel文件（通用版）
 * @param sheets 工作表配置列表（支持多sheet）
 * @param fileName 文件名（不含扩展名，默认 'export_${时间戳}'）
 * @param options 导出选项（可选）
 */
export function exportToExcel<T = any>(
  sheets: SheetConfig<T>[],
  fileName: string = `export_${Date.now()}`,
  options: any = { bookType: "xlsx", type: "buffer" },
): void {
  // 1. 空值校验
  if (!Array.isArray(sheets) || sheets.length === 0) {
    console.warn("导出Excel失败：工作表数据不能为空");
    return;
  }

  // 2. 创建工作簿
  const workbook = XLSX.utils.book_new();

  // 3. 遍历处理每个工作表
  sheets.forEach((sheetConfig, index) => {
    const {
      data = [],
      sheetName = `Sheet${index + 1}`,
      formatter = (item) => item, // 默认不格式化
    } = sheetConfig;

    // 空数据跳过（避免生成空sheet）
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`工作表 ${sheetName} 无数据，已跳过`);
      return;
    }

    // 4. 应用格式化并转换为工作表
    const formattedData = data.map(formatter);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // 5. 添加工作表到工作簿（自动处理重复sheet名称）
    const finalSheetName = getUniqueSheetName(workbook, sheetName);
    XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
  });

  // 6. 生成并下载文件
  try {
    XLSX.writeFile(workbook, `${fileName}.xlsx`, options);
    console.log(`Excel导出成功：${fileName}.xlsx`);
  } catch (error) {
    console.error("Excel导出失败：", error);
    throw new Error(`导出Excel失败：${(error as Error).message}`);
  }
}

/**
 * 默认格式化函数：将对象类型的字段转为JSON字符串
 * @param data 原始数据
 * @param fields 需要格式化的字段名（默认 'property'）
 */
export function defaultFormatter<T = any>(
  data: T,
  fields: string[] = ["property"],
): T {
  if (typeof data !== "object" || data === null) return data;

  const formatted: Record<string, any> = { ...data };
  fields.forEach((field) => {
    if (
      formatted.hasOwnProperty(field) &&
      typeof formatted[field] === "object"
    ) {
      formatted[field] = JSON.stringify(formatted[field], null, 2); // 格式化JSON，更易读
    }
  });
  return formatted as T;
}

/**
 * 获取唯一的工作表名称（避免重复）
 */
function getUniqueSheetName(workbook: XLSX.WorkBook, baseName: string): string {
  const existingNames = workbook.SheetNames;
  if (!existingNames.includes(baseName)) return baseName;

  // 重复则添加数字后缀（如 Sheet1 → Sheet1(1)）
  let counter = 1;
  let newName: string;
  do {
    newName = `${baseName}(${counter})`;
    counter++;
  } while (existingNames.includes(newName));
  return newName;
}

//import
// 定义更通用的类型
export interface SheetData {
  [key: string]: string | number | boolean | null | object | Date;
}

// 定义处理选项接口，增强通用性
export interface ExcelProcessOptions {
  /** 最小工作表数量，默认2 */
  minSheetCount?: number;
  /** 需要解析JSON的字段名列表，默认['property'] */
  jsonFields?: string[];
  /** 是否保留原始数据类型，默认true */
  preserveTypes?: boolean;
  t?: (key: string) => string;
}

/**
 * Excel处理结果类型定义
 */
export interface ExcelProcessResult {
  /** 按工作表顺序排列的数据 */
  sheets: any[][];
}

const emptyResult: ExcelProcessResult = {
  sheets: [],
};

/**
 * 通用的Excel处理函数
 * @param data Excel文件的ArrayBuffer数据
 * @param options 处理选项
 * @returns 包含各工作表数据的对象
 */
export const processExcel = (
  data: ArrayBuffer,
  options: ExcelProcessOptions = {},
): ExcelProcessResult => {
  const {
    minSheetCount = 2,
    jsonFields = ["property"],
    t = (key) => key,
  } = options;

  try {
    if (!data || data.byteLength === 0) {
      message.warn(t("device_manage.emptyFile"));
      return emptyResult;
    }

    const workbook = XLSX.read(data, {
      type: "array",
      cellDates: true, // 正确处理日期格式
      sheetStubs: true, // 保留空单元格
    });

    if (workbook.SheetNames.length < minSheetCount) {
      message.warn(t("device_manage.sheetCountError"));
      return emptyResult;
    }

    const sheets: any[][] = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];

      // 空工作表直接返回空数组
      if (!sheet) {
        sheets.push([]);
        return;
      }

      // 转换为JSON数组（空值填充为null）
      const sheetData = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
      });

      // 格式化JSON字段（纯函数，无副作用）
      const formattedData = formatJsonFields(sheetData, jsonFields);

      sheets.push(formattedData);
    });

    // 5. 返回结构化数据（兼容原有调用方式）
    return {
      sheets,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    message.error(t("device_manage.processError") + `${errorMessage}`);

    return emptyResult;
  }
};

/**
 * 通用JSON字段格式化函数（确保JSON字符串解析为对象）
 * @param data 原始工作表数据
 * @param jsonFields 需要解析的字段名列表
 * @returns 格式化后的数据（指定字段为JSON对象）
 */
function formatJsonFields(data: any[], jsonFields: string[]): any[] {
  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map((item) => {
    const formattedItem = { ...item };

    jsonFields.forEach((field) => {
      // 仅当字段存在且为字符串时解析（避免空值/非字符串解析报错）
      if (formattedItem[field] && typeof formattedItem[field] === "string") {
        try {
          // 核心：将JSON字符串解析为对象，存入item对应字段
          formattedItem[field] = JSON.parse(formattedItem[field]);
        } catch (parseError) {
          console.error(`解析字段${field}的JSON失败:`, parseError);
          // 解析失败保留原始值，避免数据丢失
          formattedItem[field] = formattedItem[field] || null;
        }
      }
    });

    return formattedItem;
  });
}
