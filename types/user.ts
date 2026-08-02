/** 微信授权/登录后的用户信息 */
export interface UserInfo {
  openid: string
  nickname?: string
  avatar?: string
}

/** 登录接口返回（对应后端 UserLoginVO：id/openid/token） */
export interface LoginResult {
  id: number
  openid: string
  token: string
}
