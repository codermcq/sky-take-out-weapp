/** 用户相关接口 */
import { mqRequest, mqUpload } from './index'
import { LoginResult, UserInfo } from '../types/user'

/** 微信登录：wx.login 拿 code 换 token（后端返回 {id, openid, token}） */
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

/** 上传文件（头像），返回永久 URL */
export function uploadFile(filePath: string) {
  return mqUpload(filePath, '/user/common/upload')
}

/** 更新用户信息（头像/昵称） */
export function updateProfile(data: { avatar?: string; name?: string }) {
  return mqRequest.put({
    url: '/user/user/profile',
    data,
  })
}

/** 查询当前用户信息 */
export function getProfile() {
  return mqRequest.get<UserInfo>({
    url: '/user/user/profile',
  })
}
