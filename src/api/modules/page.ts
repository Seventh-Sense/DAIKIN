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

export const getControllerInfo = (ip: any) => {
  return get("");
};

export const getNetWorkInterfaces = () => {
  return get("/iot/network-interfaces");
};
