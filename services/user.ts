/** 用户相关接口 */
import { mqRequest } from './index'
import { LoginResult } from '../types/user'

/** 微信登录：wx.login 拿 code 换 token */
export function login(code: string) {
  return mqRequest.post<LoginResult>({
    url: '/user/user/login',
    data: { code },
  })
}

/** 退出登录 */
export function logout() {
  return mqRequest.post({
    url: '/user/user/logout',
  })
}
