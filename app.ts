/** 苍穹外卖小程序入口 */
import userStore from './store/userStore'
import shopStore from './store/shopStore'
import shopCartStore from './store/shopCartStore'
import { isLoggedIn } from './utils/auth'

/**
 * 进入小程序即自动微信登录。
 * wx.login 静默获取 code（无需用户点授权弹窗），调后端 /user/user/login 换 token。
 * 失败不阻塞浏览（公开接口免登录），需登录操作时由 ensureLogin 引导登录页重试。
 */
function autoLogin() {
  wx.login({
    success: (res) => {
      if (!res.code) return
      userStore
        .dispatch('loginAction', res.code)
        .then(() => shopCartStore.dispatch('fetchCartAction'))
        .catch(() => {
          /* 登录失败静默处理，走登录页重试 */
        })
    },
    fail: () => {
      /* wx.login 失败，静默 */
    },
  })
}

App<IAppOption>({
  globalData: {
    screenWidth: 375,
    screenHeight: 667,
    statusBarHeight: 20,
    navigationBarHeight: 44,
    contentHeight: 0,
  },

  onLaunch() {
    const windowInfo = wx.getWindowInfo()
    this.globalData.screenWidth = windowInfo.screenWidth
    this.globalData.screenHeight = windowInfo.screenHeight
    this.globalData.statusBarHeight = windowInfo.statusBarHeight
    this.globalData.contentHeight = windowInfo.screenHeight - windowInfo.statusBarHeight - this.globalData.navigationBarHeight

    // 初始化登录态
    userStore.dispatch('loadStateFromStorage')
    // 拉取营业状态
    shopStore.dispatch('fetchStatusAction')
    // 已登录则拉购物车并同步角标；未登录则进入即自动登录
    if (isLoggedIn()) {
      shopCartStore.dispatch('fetchCartAction')
    } else {
      autoLogin()
    }
  },
})
