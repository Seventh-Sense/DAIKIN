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

export const getControllerInfo = (ip: any, fileName: string) => {
  return post(`/iot/file/download?device_address=${ip}&filename=${fileName}`);
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
