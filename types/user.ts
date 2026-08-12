/** 微信授权/登录后的用户信息 */
export interface UserInfo {
  id?: number
  openid: string
  name?: string
  phone?: string
  sex?: string
  idNumber?: string
  avatar?: string
  createTime?: string
}

/** 登录接口返回（对应后端 UserLoginVO：id/openid/token） */
export interface LoginResult {
  id: number
  openid: string
  token: string
}
