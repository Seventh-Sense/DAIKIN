import { post, get } from "../request";
import type { LoginParams } from "@/types/user";
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
