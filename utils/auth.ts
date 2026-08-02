/**
 * 按需登录工具：
 * 需要登录的操作先 await ensureLogin()，未登录则跳登录页并挂起；
 * 登录页成功/失败后调用 resolveLogin(ok) 放行调用方。
 */
import { TOKEN_KEY } from '../services/config'

let pendingLogin: ((ok: boolean) => void) | null = null

/** 是否已登录（token 存在） */
export function isLoggedIn(): boolean {
  return !!wx.getStorageSync(TOKEN_KEY)
}

/** 确保已登录；未登录跳登录页并挂起 Promise */
export function ensureLogin(): Promise<boolean> {
  if (isLoggedIn()) return Promise.resolve(true)
  return new Promise((resolve) => {
    pendingLogin = resolve
    wx.navigateTo({ url: '/pages/login/index' })
  })
}

/** 登录流程结果回传（登录页调用） */
export function resolveLogin(ok: boolean) {
  if (pendingLogin) {
    pendingLogin(ok)
    pendingLogin = null
  }
}

/** 是否有挂起的登录请求（登录页 onUnload 时判断） */
export function hasPendingLogin(): boolean {
  return pendingLogin !== null
}
