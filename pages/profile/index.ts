/** 个人中心：用户信息、订单入口、地址管理、最近订单 */
import userStore from '../../store/userStore'
import shopCartStore from '../../store/shopCartStore'
import { historyOrders } from '../../services/order'
import { isLoggedIn } from '../../utils/auth'
import { confirmCancelOrder, confirmReminder, doRepeat, confirmRefund, goPay } from '../../utils/order-actions'
import { Order } from '../../types/order'

Page({
  data: {
    loggedIn: false,
    userInfo: {} as any,
    orders: [] as Order[],
    loadingOrders: false,
  },

  onShow() {
    this.syncUser()
    if (isLoggedIn()) this.loadRecentOrders()
  },

  syncUser() {
    this.setData({
      loggedIn: userStore.state.isLoggedIn,
      userInfo: userStore.state.userInfo,
    })
  },

  loadRecentOrders() {
    this.setData({ loadingOrders: true })
    return historyOrders({ page: 1, pageSize: 10 })
      .then((res) => this.setData({ orders: res.records || [] }))
      .catch(() => this.setData({ orders: [] }))
      .finally(() => this.setData({ loadingOrders: false }))
  },

  onPullDownRefresh() {
    this.syncUser()
    if (isLoggedIn()) {
      this.loadRecentOrders().finally(() => wx.stopPullDownRefresh())
    } else {
      wx.stopPullDownRefresh()
    }
  },

  onGoLogin() {
    wx.navigateTo({ url: '/pages/login/index' })
  },

  onGoOrderList(e: WechatMiniprogram.TouchEvent) {
    const tab = Number(e.currentTarget.dataset.tab || 0)
    wx.navigateTo({ url: `/packageOrder/pages/order-list/index?tab=${tab}` })
  },

  onGoAddress() {
    wx.navigateTo({ url: '/packageAddress/pages/address-list/index' })
  },

  onOrderDetail(e: WechatMiniprogram.CustomEvent) {
    const { order } = e.detail
    wx.navigateTo({ url: `/packageOrder/pages/order-detail/index?id=${order.id}` })
  },

  onOrderAction(e: WechatMiniprogram.CustomEvent) {
    const order = e.detail.order
    const type = e.type
    switch (type) {
      case 'pay':
        goPay(order)
        break
      case 'cancel':
        confirmCancelOrder(order, () => this.loadRecentOrders())
        break
      case 'reminder':
        confirmReminder(order, () => this.loadRecentOrders())
        break
      case 'repeat':
        doRepeat(order)
        break
      case 'refund':
        confirmRefund(order, () => this.loadRecentOrders())
        break
    }
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (r) => {
        if (r.confirm) {
          userStore.dispatch('logoutAction')
          shopCartStore.dispatch('cleanAction').catch(() => {})
          this.setData({ loggedIn: false, userInfo: {}, orders: [] })
        }
      },
    })
  },
})
