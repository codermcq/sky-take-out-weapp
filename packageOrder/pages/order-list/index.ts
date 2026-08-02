/** 历史订单：全部 / 待付款 / 退款 三 tab + 分页 */
import { historyOrders } from '../../../services/order'
import { Order, OrderStatus, PayStatus } from '../../../types/order'
import { confirmCancelOrder, confirmReminder, doRepeat, confirmRefund, goPay } from '../../../utils/order-actions'

const TABS = ['全部订单', '待付款', '退款']
const PAGE_SIZE = 10

Page({
  data: {
    tabs: TABS,
    activeTab: 0,
    orders: [] as Order[],
    loading: false,
    loadingMore: false,
    finished: false,
    hasMore: true,
  },

  page: 1,
  loadingLock: false,

  onLoad(query: Record<string, string>) {
    this.setData({ activeTab: Number(query.tab || 0) })
    this.loadList(true)
  },

  onShow() {
    // 从详情返回可能状态变化，刷新
    this.loadList(true)
  },

  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const index = Number(e.detail.index)
    if (index === this.data.activeTab) return
    this.setData({ activeTab: index })
    this.loadList(true)
  },

  buildParams(): { page: number; pageSize: number; status?: number; payStatus?: number } {
    const { activeTab } = this.data
    const params: any = { page: this.page, pageSize: PAGE_SIZE }
    if (activeTab === 1) params.status = OrderStatus.PENDING_PAYMENT
    if (activeTab === 2) params.payStatus = PayStatus.REFUND
    return params
  },

  async loadList(reset: boolean) {
    if (this.loadingLock) return
    this.loadingLock = true
    if (reset) {
      this.page = 1
      this.setData({ finished: false, hasMore: true, loading: true })
    } else {
      this.setData({ loadingMore: true })
    }

    try {
      const res = await historyOrders(this.buildParams())
      const records = res.records || []
      if (reset) {
        this.setData({ orders: records })
      } else {
        this.setData({ orders: [...this.data.orders, ...records] })
      }
      const finished = records.length < PAGE_SIZE
      this.setData({ finished, hasMore: !finished })
    } catch {
      /* 错误已提示 */
    }

    this.setData({ loading: false, loadingMore: false })
    this.loadingLock = false
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.page += 1
      this.loadList(false)
    }
  },

  onOrderDetail(e: WechatMiniprogram.CustomEvent) {
    const { order } = e.detail
    wx.navigateTo({ url: `/packageOrder/pages/order-detail/index?id=${order.id}` })
  },

  onOrderAction(e: WechatMiniprogram.CustomEvent) {
    const order = e.detail.order
    switch (e.type) {
      case 'pay':
        goPay(order)
        break
      case 'cancel':
        confirmCancelOrder(order, () => this.loadList(true))
        break
      case 'reminder':
        confirmReminder(order, () => this.loadList(true))
        break
      case 'repeat':
        doRepeat(order)
        break
      case 'refund':
        confirmRefund(order, () => this.loadList(true))
        break
    }
  },
})
