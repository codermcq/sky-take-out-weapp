/** 苍穹外卖小程序入口 */
import userStore from './store/userStore'
import shopStore from './store/shopStore'
import shopCartStore from './store/shopCartStore'
import { isLoggedIn } from './utils/auth'
import { syncBadge } from './utils/cart-badge'

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
    // 已登录则拉购物车，并同步角标
    if (isLoggedIn()) {
      shopCartStore.dispatch('fetchCartAction')
    }
    shopCartStore.onState('allCount', (count) => syncBadge(count))
  },
})
