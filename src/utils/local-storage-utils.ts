/**
 * localStorage 工具类
 * 提供类型安全的存取方法，内置 JSON 序列化/反序列化、错误处理、过期时间支持
 */
class LocalStorageUtils {
  // 存储数据的前缀（避免键名冲突）
  private static readonly STORAGE_PREFIX = 'app_';

  /**
   * 设置 localStorage 数据（支持过期时间）
   * @param key 存储键名（会自动添加前缀）
   * @param value 存储值（任意可序列化类型）
   * @param expire 过期时间（单位：毫秒，可选）
   * @returns 是否设置成功
   */
  static setItem<T = unknown>(
    key: string,
    value: T,
    expire?: number
  ): boolean {
    try {
      // 检查 localStorage 是否可用
      if (!this.isStorageAvailable()) {
        console.error('localStorage 不可用');
        return false;
      }

      // 构建存储对象（包含值和过期时间）
      const storageValue = {
        data: value,
        expire: expire ? Date.now() + expire : null
      };

      // 序列化并存储（使用安全的 JSON 序列化）
      const jsonStr = JSON.stringify(storageValue);
      const fullKey = this.getFullKey(key);
      localStorage.setItem(fullKey, jsonStr);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`设置 localStorage 失败 [key: ${key}]: ${errorMsg}`, error);
      return false;
    }
  }

  /**
   * 获取 localStorage 数据
   * @param key 存储键名
   * @param defaultValue 获取失败/过期/不存在时的默认值
   * @returns 存储的值 | 默认值 | null
   */
  static getItem<T = unknown>(
    key: string,
    defaultValue?: T
  ): T | null {
    try {
      // 检查 localStorage 是否可用
      if (!this.isStorageAvailable()) {
        console.error('localStorage 不可用');
        return defaultValue ?? null;
      }

      const fullKey = this.getFullKey(key);
      const jsonStr = localStorage.getItem(fullKey);

      // 键不存在
      if (!jsonStr) {
        return defaultValue ?? null;
      }

      // 反序列化存储的数据
      const storageValue = JSON.parse(jsonStr) as {
        data: T;
        expire: number | null;
      };

      // 检查是否过期
      if (storageValue.expire && Date.now() > storageValue.expire) {
        this.removeItem(key); // 自动清理过期数据
        return defaultValue ?? null;
      }

      return storageValue.data ?? defaultValue ?? null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`获取 localStorage 失败 [key: ${key}]: ${errorMsg}`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * 删除指定 localStorage 项
   * @param key 存储键名
   * @returns 是否删除成功
   */
  static removeItem(key: string): boolean {
    try {
      if (!this.isStorageAvailable()) {
        console.error('localStorage 不可用');
        return false;
      }

      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error(`删除 localStorage 失败 [key: ${key}]: ${errorMsg}`, error);
      return false;
    }
  }

  /**
   * 清空所有本应用的 localStorage 数据（仅删除带前缀的）
   * @returns 是否清空成功
   */
  static clearAppStorage(): boolean {
    try {
      if (!this.isStorageAvailable()) {
        console.error('localStorage 不可用');
        return false;
      }

      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('清空应用 localStorage 失败:', errorMsg, error);
      return false;
    }
  }

  /**
   * 清空所有 localStorage（谨慎使用）
   * @returns 是否清空成功
   */
  static clearAllStorage(): boolean {
    try {
      if (!this.isStorageAvailable()) {
        console.error('localStorage 不可用');
        return false;
      }

      localStorage.clear();
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('清空所有 localStorage 失败:', errorMsg, error);
      return false;
    }
  }

  /**
   * 检查 localStorage 是否可用（处理隐私模式/存储满等情况）
   * @returns 是否可用
   */
  private static isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取带前缀的完整键名
   * @param key 原始键名
   * @returns 带前缀的键名
   */
  private static getFullKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }
}

// 导出工具类
export default LocalStorageUtils;