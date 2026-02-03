/**
 * JSON 处理工具类
 * 提供类型安全的 JSON 解析和序列化方法，包含完善的错误处理
 */
class JsonUtils {
  /**
   * 安全解析 JSON 字符串
   * @param jsonString 要解析的 JSON 字符串
   * @param defaultValue 解析失败时返回的默认值（可选）
   * @returns 解析后的对象 | 默认值 | null
   */
  static parse<T = unknown>(
    jsonString: string | null | undefined,
    defaultValue?: T
  ): T | null {
    // 空值处理
    if (jsonString == null || jsonString === '') {
      return defaultValue ?? null;
    }

    try {
      // 尝试解析 JSON
      const parsedData = JSON.parse(jsonString) as T;
      return parsedData;
    } catch (error) {
      // 捕获并处理所有解析错误
      const errorMessage = error instanceof Error ? error.message : '未知解析错误';
      console.error(`JSON 解析失败: ${errorMessage}`, { input: jsonString });
      return defaultValue ?? null;
    }
  }

  /**
   * 安全序列化对象为 JSON 字符串
   * @param data 要序列化的对象
   * @param space 格式化缩进空格数（可选，默认无缩进）
   * @param defaultValue 序列化失败时返回的默认值（可选）
   * @returns 序列化后的 JSON 字符串 | 默认值 | ''
   */
  static stringify<T = unknown>(
    data: T,
    space?: number,
    defaultValue?: string
  ): string {
    // 特殊值处理
    if (data === undefined) {
      return defaultValue ?? '';
    }

    try {
      // 尝试序列化
      const jsonString = JSON.stringify(data, null, space);
      return jsonString;
    } catch (error) {
      // 捕获并处理所有序列化错误
      const errorMessage = error instanceof Error ? error.message : '未知序列化错误';
      console.error(`JSON 序列化失败: ${errorMessage}`, { input: data });
      return defaultValue ?? '';
    }
  }

  /**
   * 带循环引用处理的 JSON 序列化
   * @param data 要序列化的对象
   * @param space 格式化缩进空格数（可选）
   * @param defaultValue 序列化失败时返回的默认值（可选）
   * @returns 序列化后的 JSON 字符串 | 默认值 | ''
   */
  static stringifyWithCircularCheck<T = unknown>(
    data: T,
    space?: number,
    defaultValue?: string
  ): string {
    const seen = new WeakSet();
    
    try {
      const jsonString = JSON.stringify(
        data,
        (key, value) => {
          // 处理循环引用
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular Reference]';
            }
            seen.add(value);
          }
          return value;
        },
        space
      );
      return jsonString;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知序列化错误';
      console.error(`带循环检测的 JSON 序列化失败: ${errorMessage}`, { input: data });
      return defaultValue ?? '';
    }
  }
}

// 导出工具类，方便项目中导入使用
export default JsonUtils;