import { post, get } from "../request";

export const getVersion = () => {
  return get("");
};

export const getControllerList = (data: any) => {
  return post("/iot/discover", data, {
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
  });
};

export const getNetWorkInterfaces = () => {
  return get("/iot/network-interfaces");
};

export const discoveryBacnetDevices = (ip: string) => {
  return post(`/iot/bacnet/discover`, {
    network_interface: ip,
    timeout: 10,
  });
};

export const discoveryBacnetPoints = (data: any) => {
  return post(`/iot/bacnet/points`, data);
};

//上传文件
export const uploadUpgradeFile = (ip: any, file: any, filename: string) => {
  const formData = new FormData();

  formData.append("device_address", ip);
  formData.append("file", file); // 文件
  formData.append("filename", filename);

  return post("/iot/file/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const fetchTaskStatus = (task_id: string) => {
  return get("/iot/file/status/" + task_id);
};

export const downloadFile = (ip: any, filename: string) => {
  return post(`/iot/file/download?device_address=${ip}&filename=${filename}`);
};

export const rebootDevice = (ip: string) => {
  return post("/iot/reboot", { device_address: ip });
};

//读取点位当前值
export const readPointValue = (data: any) => {
  return post(`/iot/read-points`, data);
};

export const writePointValue = (data: any) => {
  return post(`/iot/write-points`, data);
};

//上传配置
export const setConfigFile = (ip: string, file: any, series: string) => {
  const formData = new FormData();

  formData.append("device_address", ip);
  formData.append("file", file); // 文件
  formData.append("product_series", series);

  return post("/iot/config", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
