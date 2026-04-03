export const parseYaml = (data: any) => {};

export const formatMessage = (key: string, params?: Record<string, any>) => {
  // 安全校验：确保i18n实例存在
  if (!window.$i18n) {
    console.warn("i18n instance is not initialized");
    return key; // 回退返回原始key
  }

  // 使用global.t方法进行翻译
  return window.$i18n.global.t(key);
};

/**
 * 生成带时间戳的唯一ID
 * 格式：时间戳 + 随机串
 */
export function generateTimeUniqueId(): string {
  const timestamp = Date.now().toString(36); // 时间戳转短字符串
  const randomStr = Math.random().toString(36).slice(2, 8); // 6位随机
  return `${timestamp}_${randomStr}`;
}
