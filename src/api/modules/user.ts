import { post, get } from "../request"
import type { LoginParams } from "@/types/user";



export const loginApi = (params: LoginParams) => {
  return get('/iot/projects', params)
}