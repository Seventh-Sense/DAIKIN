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
 *
 */
export function generateTimeUniqueId(): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  // 环境正常时继续用原生 API
  return crypto.randomUUID();
}

export const isValidIP = (ip: string): boolean => {
  const ipReg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return ipReg.test(ip.trim());
};
