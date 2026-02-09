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
