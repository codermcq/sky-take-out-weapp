/** 登录态 store：token 与 storage 双向同步 */
import { HYEventStore } from 'hy-event-store'
import { login as loginApi, logout as logoutApi } from '../services/user'
import { TOKEN_KEY } from '../services/config'
import { UserInfo } from '../types/user'

const userStore = new HYEventStore({
  state: {
    token: '',
    userInfo: {} as UserInfo,
    isLoggedIn: false,
  },
  actions: {
    /** 启动时从 storage 恢复登录态 */
    loadStateFromStorage(ctx: any) {
      const token = wx.getStorageSync(TOKEN_KEY)
      if (token) {
        ctx.token = token
        ctx.isLoggedIn = true
      }
    },
    /** 微信登录：wx.login 拿 code 换 token */
    loginAction(ctx: any, code: string) {
      return loginApi(code).then((res) => {
        ctx.token = res.token
        ctx.userInfo = {
          openid: res.openid,
          nickname: res.nickname || '',
          avatar: res.avatar || '',
        }
        ctx.isLoggedIn = true
        wx.setStorageSync(TOKEN_KEY, res.token)
        return res
      })
    },
    /** 更新用户资料（头像/昵称） */
    setUserInfoAction(ctx: any, info: Partial<UserInfo>) {
      ctx.userInfo = { ...ctx.userInfo, ...info }
    },
    /** 退出登录 */
    logoutAction(ctx: any) {
      logoutApi().catch(() => {
        /* 后端登出失败不阻塞本地清理 */
      })
      ctx.token = ''
      ctx.userInfo = {}
      ctx.isLoggedIn = false
      wx.removeStorageSync(TOKEN_KEY)
    },
  },
})

export default userStore
