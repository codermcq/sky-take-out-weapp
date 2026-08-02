/** 订单详情：按状态渲染操作 */
import { orderDetail } from '../../../services/order'
import { Order, OrderStatus, PayStatus } from '../../../types/order'
import { confirmCancelOrder, confirmReminder, doRepeat, confirmRefund, goPay } from '../../../utils/order-actions'

const STATUS_TEXT: Record<number, string> = {
  [OrderStatus.PENDING_PAYMENT]: '待付款',
  [OrderStatus.TO_BE_CONFIRMED]: '待接单',
  [OrderStatus.CONFIRMED]: '已接单',
  [OrderStatus.DELIVERY_IN_PROGRESS]: '派送中',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
}

Page({
  data: {
    orderId: 0,
    order: null as Order | null,
    loading: true,
    statusText: '',
    fullAddress: '',
    goodsPrice: 0,
  },

  onLoad(query: Record<string, string>) {
    const orderId = Number(query.id || 0)
    this.setData({ orderId })
    this.loadDetail()
  },

  loadDetail() {
    this.setData({ loading: true })
    orderDetail(this.data.orderId)
      .then((order) => {
        const goodsPrice = (order.orderDetailList || []).reduce((sum, d) => sum + d.amount * d.number, 0)
        const fullAddress = `${order.phone || ''} ${order.address || ''}`
        this.setData({
          order,
          statusText: STATUS_TEXT[order.status] || '',
          fullAddress,
          goodsPrice: Math.round(goodsPrice * 100) / 100,
        })
      })
      .catch(() => this.setData({ order: null }))
      .finally(() => this.setData({ loading: false }))
  },

  onGoPay() {
    if (this.data.order) goPay(this.data.order)
  },

  onAction(e: WechatMiniprogram.TouchEvent) {
    const order = this.data.order
    if (!order) return
    const type = String(e.currentTarget.dataset.type)
    switch (type) {
      case 'cancel':
        confirmCancelOrder(order, () => this.loadDetail())
        break
      case 'reminder':
        confirmReminder(order, () => this.loadDetail())
        break
      case 'repeat':
        doRepeat(order)
        break
      case 'refund':
        confirmRefund(order, () => this.loadDetail())
        break
    }
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/home/index' })
  },
})
