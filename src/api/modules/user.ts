import { post, get } from "../request"

export interface LoginParams {
  username: string
  password: string
}


export const loginApi = (params: LoginParams) => {
  return get('/iot/projects', params)
}