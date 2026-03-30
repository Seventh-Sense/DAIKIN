import { post, get, put } from "../request";
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

//读取用户信息
export const getUserInfo = () => {
  return get('/users/me')
}

//修改用户信息
export const updateUserInfo = (id: any, data: any) => {
  return put('/users/' + id, data)
}

//读取用户列表
export const getUserList = () => {
  return get('/users')
}