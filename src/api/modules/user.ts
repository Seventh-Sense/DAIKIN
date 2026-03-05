import { post, get } from "../request"
import type { LoginParams } from "@/types/user";



export const loginApi = (params: any) => {
  return get('/iot/projects', params)
}