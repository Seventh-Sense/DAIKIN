import router from "@/router";
import type { RouteLocationRaw } from "vue-router";

// 推导 router.resolve() 的返回值类型（兼容所有 Vue Router 4.x，无需依赖 RouteResolved）
type RouteResolveResult = ReturnType<typeof router.resolve>;

/**
 * 根据名字跳转路由
 * @param pageName 路由名称
 * @param isReplace 是否替换当前路由（不产生历史记录）
 * @param windowOpen 是否在新窗口打开
 */
export const routerTurnByName = (
  pageName: string,
  isReplace?: boolean,
  windowOpen?: boolean,
) => {
  // 前置校验：路由名称不能为空
  if (!pageName?.trim()) {
    console.warn("routerTurnByName：路由名称不能为空");
    return;
  }

  if (windowOpen) {
    const path = fetchPathByName(pageName, "href");
    // 新窗口打开时，路径不能为空且必须是字符串
    if (path && typeof path === "string") {
      openNewWindow(path);
    } else {
      console.warn(`routerTurnByName：未找到名称为${pageName}的路由路径`);
    }
    return;
  }

  // 路由跳转配置
  const routeConfig: RouteLocationRaw = { name: pageName };

  try {
    if (isReplace) {
      router.replace(routeConfig);
    } else {
      router.push(routeConfig);
    }
  } catch (error) {
    console.error(`routerTurnByName：跳转路由${pageName}失败`, error);
  }
};

// routerTurnByNameWithParams(
//   "userDetail", // 路由名称
//   { id: 1001 }, // 路径参数（对应路由 /user/:id）
//   { tab: "info", tags: [1, 2] }, // 查询参数（URL最终为 /user/1001?tab=info&tags=1&tags=2）
//   false, // 不替换路由
//   false // 不新窗口打开
// );
/**
 * 根据名称跳转路由（携带参数）
 * @param pageName 路由名称
 * @param params 路径参数（对应路由配置中的 :param 占位符）
 * @param query 查询参数（拼接在URL后的 ?key=value 形式）
 * @param isReplace 是否替换当前路由（不产生历史记录）
 * @param windowOpen 是否在新窗口打开
 */
export const routerTurnByNameWithParams = (
  pageName: string,
  params?: Record<string, string | number>,
  query?: Record<string, string | number | (string | number)[]>,
  isReplace?: boolean,
  windowOpen?: boolean,
) => {
  // 前置校验：路由名称不能为空
  if (!pageName?.trim()) {
    console.warn("routerTurnByNameWithParams：路由名称不能为空");
    return;
  }

  // 构建路由配置（包含名称、参数、查询参数）
  const routeConfig: RouteLocationRaw = {
    name: pageName,
    // 过滤空的params（避免参数值为null/undefined导致跳转异常）
    ...(params && Object.keys(params).length > 0 
      ? { params: Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value != null && value.toString().trim() !== "")
        )} 
      : {}),
    // 过滤空的query
    ...(query && Object.keys(query).length > 0 
      ? { query: Object.fromEntries(
          Object.entries(query).filter(([_, value]) => {
            if (Array.isArray(value)) {
              return value.length > 0 && value.every(item => item != null && item.toString().trim() !== "");
            }
            return value != null && value.toString().trim() !== "";
          })
        )} 
      : {})
  };

  if (windowOpen) {
    // 解析带参数的完整URL
    const pathData = router.resolve(routeConfig);
    if (pathData.href) {
      openNewWindow(pathData.href);
    } else {
      console.warn(`routerTurnByNameWithParams：未找到名称为${pageName}的路由路径（带参数）`);
    }
    return;
  }

  try {
    if (isReplace) {
      router.replace(routeConfig);
    } else {
      router.push(routeConfig);
    }
  } catch (error) {
    console.error(`routerTurnByNameWithParams：跳转路由${pageName}失败（参数：${JSON.stringify(params)}, 查询参数：${JSON.stringify(query)}）`, error);
  }
};

/**
 * 根据路径跳转路由
 * @param path 路由路径
 * @param query 路径参数（拼接在path后，以/分隔）
 * @param isReplace 是否替换当前路由（不产生历史记录）
 * @param windowOpen 是否在新窗口打开
 */
export const routerTurnByPath = (
  path: string,
  query?: (string | number)[],
  isReplace?: boolean,
  windowOpen?: boolean,
) => {
  // 前置校验：基础路径不能为空
  if (!path?.trim()) {
    console.warn("routerTurnByPath：路由基础路径不能为空");
    return;
  }

  // 拼接完整路径（修复原有：无query时fullPath为空的问题）
  let fullPath = path;
  if (query && query.length > 0) {
    // 过滤query中的空值，避免出现//拼接错误
    const validQuery = query.filter(
      (item) => item != null && item.toString().trim() !== "",
    );
    if (validQuery.length > 0) {
      fullPath = `${path}/${validQuery.join("/")}`;
    }
  }

  if (windowOpen) {
    openNewWindow(fullPath);
    return;
  }

  // 路由跳转配置
  const routeConfig: RouteLocationRaw = { path: fullPath };

  try {
    if (isReplace) {
      router.replace(routeConfig);
    } else {
      router.push(routeConfig);
    }
  } catch (error) {
    console.error(`routerTurnByPath：跳转路由${fullPath}失败`, error);
  }
};

/**
 * 根据名称获取路由信息
 * @param pageName 路由名称
 * @param prop 可选：需要获取的路由信息属性（如href、path）
 * @returns 路由信息或指定属性值
 */
export const fetchPathByName = (
  pageName: string,
  prop?: keyof RouteResolveResult, // 用推导的类型限制合法属性，替代 RouteResolved
) => {
  // 前置校验
  if (!pageName?.trim()) {
    console.warn("fetchPathByName：路由名称不能为空");
    return null;
  }

  try {
    const pathData: RouteResolveResult = router.resolve({ name: pageName });

    // 无prop时返回完整路由信息，有prop时返回指定属性值
    return prop ? pathData[prop] : pathData;
  } catch (error) {
    console.error(`fetchPathByName：获取${pageName}路由信息失败`, error);
    return null;
  }
};

/**
 * 新开页面
 * @param url 页面链接
 */
export const openNewWindow = (url: string) => {
  // 前置校验：URL不能为空
  if (!url?.trim()) {
    console.warn("openNewWindow：打开的链接不能为空");
    return null;
  }

  try {
    const newWindow = window.open(url, "_blank");
    // 检测是否被浏览器弹窗拦截
    if (!newWindow) {
      console.warn("openNewWindow：新窗口被浏览器弹窗拦截，请允许弹窗权限");
    }
    return newWindow;
  } catch (error) {
    console.error("openNewWindow：打开新窗口失败", error);
    return null;
  }
};
