import { routerTurnByPath } from "@/router/util";
import { useStepStore } from "@/pinia/modules/step";

/**
 * 已知二级菜单，查找当前三级菜单的下一个key
 * @param currentKey 当前三级菜单key（如：1-17706046352452bd91-1）
 * @param secondMenu 已获取的二级菜单对象
 * @param loop 是否循环（最后一项返回第一项，默认false）
 * @returns 下一个菜单key | null
 */
export const findNextMenu = (
  currentKey: string,
  secondMenu: any,
  loop = false,
): string | null => {
  // 1. 校验二级菜单和子项
  if (!secondMenu?.children?.length) return null;

  // 2. 找到当前三级菜单的索引
  const currentIndex = secondMenu.children.findIndex(
    (item: any) => item.key === currentKey,
  );

  // 3. 无匹配项/已是最后一项（且不循环）返回null
  if (currentIndex === -1) return null;
  if (currentIndex + 1 >= secondMenu.children.length) {
    return loop ? secondMenu.children[0] : null;
  }

  // 4. 返回下一个key
  return secondMenu.children[currentIndex + 1];
};

/**
 * 编辑完成后跳转到下一步的通用方法
 * @returns {Promise<void>}
 */
export async function handleEditCompleteJump() {
  const stepStore = useStepStore();
  
  try {
    // 1. 获取下一个菜单信息
    const nextMenu: any = findNextMenu(stepStore.currentStep, stepStore.currentMenuData);
    
    if (!nextMenu) {
      console.warn("未找到下一个菜单，跳转失败");
      return;
    }

    // 2. 更新步骤存储状态
    stepStore.updateMenuSelectedKeys([nextMenu.key]);
    stepStore.updateCurrentStep(nextMenu.key);

    // 3. 路由跳转
    routerTurnByPath(nextMenu.path);
  } catch (error) {
    console.error("编辑完成跳转失败:", error);
  }
}


/**
 * 校验IPv4地址格式 (严格模式)
 * @param ip 待校验的IP地址字符串
 * @returns 是否合法的IPv4地址
 */
export const validateIPv4 = (ip: string): boolean => {
  // 正则说明：
  // 1. 0-255的数字，不允许前导零（01无效，0本身有效）
  // 2. 四组数字用点分隔
  const ipv4Regex = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/
  return ipv4Regex.test(ip)
}

// 工具函数：格式化日期时间到分钟（格式：YYYYMMDD_HHmm）
export const formatDateTimeToMinute = (): string => {
  const now = new Date();
  // 年（4位）
  const year = now.getFullYear().toString();
  // 月（补0到2位）
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  // 日（补0到2位）
  const day = now.getDate().toString().padStart(2, "0");
  // 时（补0到2位）
  const hour = now.getHours().toString().padStart(2, "0");
  // 分（补0到2位）
  const minute = now.getMinutes().toString().padStart(2, "0");
  
  // 拼接格式：YYYYMMDD_HHmm
  return `${year}${month}${day}_${hour}${minute}`;
};

