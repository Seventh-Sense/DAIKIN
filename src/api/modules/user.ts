import { post, get, put, del } from "../request";
import qs from "qs";

export const loginApi = (params: any) => {
  const data = {
    grant_type: "password",
    scope: "",
    client_id: "string",
    client_secret: "********",
    ...params,
  };

  return post("/users/login", qs.stringify(data), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
  });
};

//
export const refreshToken = (refreshToken: string) => {
  return post("/users/refresh", { refresh_token: refreshToken });
};

//读取用户信息
export const getUserInfo = () => {
  return get("/users/me");
};

//修改用户信息
export const updateUserInfo = (id: any, data: any) => {
  return put("/users/" + id, data);
};

//读取用户列表
export const getUserList = () => {
  return get("/users");
};

//新增用户
export const registerUser = (data: any) => {
  return post("/users/register", data);
};

//删除用户
export const deleteUser = (id: any) => {
  return del("/users/" + id);
};
