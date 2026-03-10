import { get, post, del, patch } from "../request";

interface ApiResponse<T = any> {
  data: T;
  status: string;
}

export const getDevices = () => {
  return get("/devices");
};

export const setDeviceEnable = (deviceId: string, enabled: any) => {
  return post(`/enable?device_id=${deviceId}&enable=${enabled}`, enabled);
};

export const deleteDevice = (deviceId: string) => {
  return del(`/device/` + deviceId);
};

export const readBacnetAttr = (deviceId: any, data: any) => {
  return post(`/request?device_id=${deviceId}`, data);
};

/**
 * 并发请求多个URL
 * @param urls 请求的URL数组
 * @returns 包含所有响应结果的Promise
 */
export const concurrentRequests = <T>(
  urls: string[],
): Promise<ApiResponse<T>[]> => {
  const requests = urls.map((url) =>
    get(url).then((res) => ({
      data: res.data,
      status: res.status,
    })),
  );

  // 等待所有请求完成
  return Promise.all(requests);
};

export const importFileData = (data: any) => {
  return post(`/import/data`, data);
};

export const discoveryDevices = () => {
  return get(`/bacnet/discovery`);
};

export const addDevice = (data: any) => {
  return post("/device", data);
};

export const readSubscribePoints = (deviceId: any) => {
  return get(`/metrics/` + deviceId);
};

export const readPointValue = (deviceId: any) => {
  return get(`/points/latest?device_id=${deviceId}`);
};

export const deleteSubscribePoint = (pointId: any) => {
  return del(`/metric/` + pointId);
};

export const deleteAllSubscribePoint = (deviceId: any) => {
  return del(`/metrics/` + deviceId);
};

export const readIotPoints = (deviceId: any, data: any) => {
  return post(`/request?device_id=${deviceId}`, data);
};

export const addSubscribePoint = (data: any) => {
  return post(`/metrics`, data);
};

export const updateIotPoints = (id: any, data: any) => {
  return patch(`/metric/` + id, data);
};

export const createModbusPoint = (data: any) => {
  return post(`/metric`, data);
};
