export type UserInfo = {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  roles: string[]; // 用户角色，用于权限控制
  token: string;
}


export interface LoginParams {
  username: string
  password: string
}
