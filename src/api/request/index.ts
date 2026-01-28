import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TIMEOUT = 10000;

const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json;charset=utf-8", // 默认请求头
  },
});

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 统一设置用户身份 Token
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一处理响应错误，例如 token 无效、服务端异常等
    return Promise.resolve(response.data);
  },
  (err: AxiosError) => {
    return Promise.reject(err);
  },
);

export const get = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return service.get(url, {
    params,
    ...config,
  });
};

export const post = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return service.post(url, data, config);
};

export const del = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  // 方式1：参数拼在 URL 上（默认）
  if (data && !config?.data) {
    return service.delete(url, {
      params: data,
      ...config,
    });
  }
  // 方式2：参数放在请求体中（需后端支持）
  return service.delete(url, {
    data,
    ...config,
  });
};

export const put = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return service.put(url, data, config);
};

export const patch = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return service.patch(url, data, config);
};

// 9. 封装 OPTIONS 方法：预检/检测接口可用性，支持 URL 拼参
/**
 * @param url 请求地址
 * @param params 请求参数（对象格式，拼在 URL 上）
 * @param config 额外的 axios 配置（可选）
 */
export const options = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return service.options(url, {
    params,
    ...config,
  });
};

export default service;
